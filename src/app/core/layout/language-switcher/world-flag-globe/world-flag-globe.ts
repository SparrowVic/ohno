import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import * as d3Scale from 'd3-scale';
import { animate } from 'animejs';
import type {
  BufferGeometry,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { I18N_KEY } from '../../../i18n/i18n-keys';

type ThreeModule = typeof import('three');
type OrbitControlsCtor = new (object: PerspectiveCamera, domElement?: HTMLElement) => OrbitControls;
type CountryMarkerTuple = readonly [string, string, number, number, string];
type SurfaceDotTuple = readonly [number, number, number, number];
type BoundaryDotTuple = readonly [number, number];

interface CountryMarker {
  readonly code: string;
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
  readonly flag: string;
}

interface GlobeMarker {
  readonly countryIndex: number;
  readonly country: CountryMarker;
  readonly normal: Vector3;
  pulseBoost: number;
}

interface FlagRaster {
  readonly data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly fallback: readonly [number, number, number];
}

interface CountryProjectionFrame {
  readonly normal: Vector3;
  readonly tangent: Vector3;
  readonly bitangent: Vector3;
  minU: number;
  maxU: number;
  minV: number;
  maxV: number;
}

let countriesCache: readonly CountryMarker[] | null = null;
let surfaceDotsCache: readonly SurfaceDotTuple[] | null = null;
let boundaryDotsCache: readonly BoundaryDotTuple[] | null = null;

const COUNTRY_PALETTE = [
  '#8cf4ff',
  '#75deff',
  '#61bbff',
  '#7f93ff',
  '#ab7fff',
  '#f08cff',
  '#ff9a83',
  '#ffc870',
  '#d8ee72',
  '#88f2c4',
  '#5cd9b6',
  '#9db8ff',
  '#e1efff',
] as const;

@Component({
  selector: 'app-world-flag-globe',
  imports: [TranslocoPipe],
  templateUrl: './world-flag-globe.html',
  styleUrl: './world-flag-globe.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldFlagGlobe implements AfterViewInit {
  protected readonly I18N_KEY = I18N_KEY;
  readonly hoveredCountry = signal<CountryMarker | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly hoverFlag = computed(() => this.hoveredCountry()?.flag ?? '🌍');
  readonly countrySelected = output<CountryMarker>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private readonly canvasHostRef = viewChild.required<ElementRef<HTMLDivElement>>('canvasHost');
  private readonly hudRef = viewChild<ElementRef<HTMLDivElement>>('hud');
  private readonly hoverFlagCardRef = viewChild<ElementRef<HTMLDivElement>>('hoverFlagCard');

  private readonly opacityScale = d3Scale
    .scaleLinear()
    .domain([-0.08, 0.06, 0.22, 1])
    .range([0, 0.08, 0.72, 1])
    .clamp(true);
  private readonly introState = { progress: 0 };

  private three: ThreeModule | null = null;
  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private renderer: WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private raycaster: Raycaster | null = null;
  private pointer: Vector2 | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private animationFrameId: number | null = null;
  private starField: Points | null = null;
  private surfaceField: Points | null = null;
  private surfaceGlowField: Points | null = null;
  private boundaryField: Points | null = null;
  private boundaryGlowField: Points | null = null;
  private hoverCountryField: Points | null = null;
  private globeGroup: Group | null = null;
  private atmosphereMaterial: MeshBasicMaterial | null = null;
  private shellMaterial: Material | null = null;
  private surfaceMaterial: PointsMaterial | null = null;
  private surfaceGlowMaterial: PointsMaterial | null = null;
  private boundaryMaterial: PointsMaterial | null = null;
  private boundaryGlowMaterial: PointsMaterial | null = null;
  private hoverCountryMaterial: PointsMaterial | null = null;
  private ringMeshes: Mesh[] = [];
  private ringMaterials: MeshBasicMaterial[] = [];
  private markers: GlobeMarker[] = [];
  private dotTexture: Texture | null = null;
  private readonly flagRasters = new Map<string, FlagRaster>();
  private surfaceCountryIndices: Uint16Array | null = null;
  private surfacePositionsByCountry = new Map<number, Float32Array>();
  private surfaceColorsByCountry = new Map<number, Float32Array>();
  private hoveredMarker: GlobeMarker | null = null;
  private disposed = false;

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const renderer = this.renderer;
    const camera = this.camera;
    const raycaster = this.raycaster;
    const pointer = this.pointer;
    const surfaceField = this.surfaceField;
    if (!renderer || !camera || !raycaster || !pointer || !surfaceField) {
      return;
    }

    const rect = renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    raycaster.params.Points.threshold = 0.044;

    const surfaceHit = raycaster.intersectObject(surfaceField, false)[0];
    const nextMarker =
      surfaceHit && typeof surfaceHit.index === 'number'
        ? this.findMarkerBySurfaceIndex(surfaceHit.index)
        : null;

    this.setHoveredMarker(nextMarker);
    renderer.domElement.style.cursor = nextMarker ? 'pointer' : 'grab';
  };

  private readonly handlePointerLeave = (): void => {
    if (this.renderer) {
      this.renderer.domElement.style.cursor = 'grab';
    }
    this.setHoveredMarker(null);
  };

  private readonly handlePointerDown = (): void => {
    if (this.renderer) {
      this.renderer.domElement.style.cursor = 'grabbing';
    }
  };

  private readonly handlePointerUp = (): void => {
    if (this.renderer) {
      this.renderer.domElement.style.cursor = this.hoveredMarker ? 'pointer' : 'grab';
    }
  };

  private readonly handleClick = (): void => {
    if (!this.hoveredMarker) {
      return;
    }

    const marker = this.hoveredMarker;
    animate(marker, {
      pulseBoost: [0, 1, 0],
      duration: 680,
      ease: 'inOutQuad',
    });
    this.zone.run(() => {
      this.countrySelected.emit(marker.country);
    });
  };

  constructor() {
    this.destroyRef.onDestroy(() => this.destroy());
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    void this.initialize();
  }

  private async initialize(): Promise<void> {
    const host = this.canvasHostRef().nativeElement;
    this.loading.set(true);
    this.loadError.set(false);

    try {
      const [THREE, controlsModule, countries, surfaceDots, boundaryDots] = await Promise.all([
        import('three'),
        import('three/examples/jsm/controls/OrbitControls.js'),
        loadCountries(),
        loadSurfaceDots(),
        loadBoundaryDots(),
      ]);

      if (this.disposed) {
        return;
      }

      this.setupScene(
        THREE,
        controlsModule.OrbitControls,
        host,
        countries,
        surfaceDots,
        boundaryDots,
      );
      this.loading.set(false);
      this.playIntro();
      this.playHudIntro();
    } catch (error) {
      console.error(error);
      this.loadError.set(true);
      this.loading.set(false);
    }
  }

  private setupScene(
    THREE: ThreeModule,
    OrbitControlsClass: OrbitControlsCtor,
    host: HTMLDivElement,
    countries: readonly CountryMarker[],
    surfaceDots: readonly SurfaceDotTuple[],
    boundaryDots: readonly BoundaryDotTuple[],
  ): void {
    this.destroyScene();

    const width = Math.max(host.clientWidth, 320);
    const height = Math.max(host.clientHeight, 320);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040914, 0.045);
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0.04, 0.1, 5.58);

    const ambient = new THREE.AmbientLight(0xa9ddff, 1.7);
    const keyLight = new THREE.DirectionalLight(0x7dc7ff, 2.2);
    keyLight.position.set(3.8, 2.6, 4.8);
    const rimLight = new THREE.DirectionalLight(0xff9d6b, 1.2);
    rimLight.position.set(-4.2, -1.4, -3.2);
    scene.add(ambient, keyLight, rimLight);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.set(-0.14, -0.46, 0.08);
    scene.add(globeGroup);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 72, 72),
      new THREE.MeshPhysicalMaterial({
        color: 0x041624,
        emissive: 0x0b4d7e,
        emissiveIntensity: 0.68,
        roughness: 0.72,
        metalness: 0.08,
        clearcoat: 0.24,
        clearcoatRoughness: 0.42,
      }),
    );
    globeGroup.add(globe);

    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x91d6ff,
      wireframe: true,
      transparent: true,
      opacity: 0.003,
    });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1.64, 36, 36), shellMaterial);
    globeGroup.add(shell);

    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x48c8ff,
      transparent: true,
      opacity: 0.026,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.67, 72, 72), atmosphereMaterial);
    globeGroup.add(atmosphere);

    this.dotTexture = this.createDotTexture(THREE);
    this.createCountrySurface(THREE, globeGroup, countries, surfaceDots, boundaryDots);

    this.markers = this.createMarkers(THREE, countries);
    const starField = this.createStarField(THREE);
    scene.add(starField);

    const controls = new OrbitControlsClass(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.rotateSpeed = 0.78;
    controls.zoomSpeed = 0.75;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.52;
    controls.minDistance = 2.95;
    controls.maxDistance = 12.4;
    controls.minPolarAngle = 0.32;
    controls.maxPolarAngle = Math.PI - 0.32;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    renderer.domElement.addEventListener('pointermove', this.handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', this.handlePointerLeave);
    renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
    renderer.domElement.addEventListener('pointerup', this.handlePointerUp);
    renderer.domElement.addEventListener('click', this.handleClick);

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = Math.max(host.clientWidth, 320);
      const nextHeight = Math.max(host.clientHeight, 320);
      renderer.setSize(nextWidth, nextHeight, false);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(host);

    this.three = THREE;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.controls = controls;
    this.raycaster = raycaster;
    this.pointer = pointer;
    this.resizeObserver = resizeObserver;
    this.starField = starField;
    this.globeGroup = globeGroup;
    this.atmosphereMaterial = atmosphereMaterial;
    this.shellMaterial = shellMaterial;
    this.ringMeshes = [];
    this.ringMaterials = [];
    this.hoveredMarker = null;
    this.zone.runOutsideAngular(() => this.startLoop());
  }

  private createMarkers(THREE: ThreeModule, countries: readonly CountryMarker[]): GlobeMarker[] {
    return countries.map((country, countryIndex) => ({
      countryIndex,
      country,
      normal: latLonToVector(THREE, country.lat, country.lon),
      pulseBoost: 0,
    }));
  }

  private createCountrySurface(
    THREE: ThreeModule,
    globeGroup: Group,
    countries: readonly CountryMarker[],
    surfaceDots: readonly SurfaceDotTuple[],
    boundaryDots: readonly BoundaryDotTuple[],
  ): void {
    const dotTexture = this.dotTexture;
    if (!dotTexture) {
      return;
    }

    const palette = COUNTRY_PALETTE.map((entry) => new THREE.Color(entry));
    const projectionFrames = countries.map((country) =>
      createCountryProjectionFrame(THREE, country.lat, country.lon),
    );
    const flagRasters = countries.map((country, index) => {
      const fallback = palette[index % palette.length];
      return this.getFlagRaster(country.flag, [fallback.r, fallback.g, fallback.b]);
    });

    surfaceDots.forEach(([lat, lon, , countryIndex]) => {
      const frame = projectionFrames[countryIndex];
      if (!frame) {
        return;
      }

      const normal = latLonToVector(THREE, lat, lon);
      const [u, v] = projectVectorIntoCountryFrame(normal, frame);
      frame.minU = Math.min(frame.minU, u);
      frame.maxU = Math.max(frame.maxU, u);
      frame.minV = Math.min(frame.minV, v);
      frame.maxV = Math.max(frame.maxV, v);
    });

    const surfacePositionList: number[] = [];
    const surfaceColorList: number[] = [];
    const surfaceCountryIndexList: number[] = [];
    const countryPositions = new Map<number, number[]>();
    const countryColors = new Map<number, number[]>();

    surfaceDots.forEach(([lat, lon, , countryIndex], seed) => {
      const normal = latLonToVector(THREE, lat, lon);
      const frame = projectionFrames[countryIndex];
      const flagRaster = flagRasters[countryIndex];

      if (!frame || !flagRaster) {
        return;
      }

      const coords = countryPositions.get(countryIndex) ?? [];
      const cColors = countryColors.get(countryIndex) ?? [];

      createSurfaceCluster(seed).forEach(([offsetX, offsetY], variantIndex) => {
        const point = offsetPointOnSphere(THREE, normal, offsetX, offsetY, 1.606);
        const [u, v] = projectVectorIntoCountryFrame(point.clone().normalize(), frame);
        const color = sampleFlagRasterColor(
          flagRaster,
          normalizeToUnit(u, frame.minU, frame.maxU),
          1 - normalizeToUnit(v, frame.minV, frame.maxV),
        );
        const luminanceBoost = variantIndex === 0 ? 0.08 : variantIndex < 4 ? 0.03 : -0.03;
        const r = clamp01(color[0] + luminanceBoost);
        const g = clamp01(color[1] + luminanceBoost);
        const b = clamp01(color[2] + luminanceBoost);
        surfacePositionList.push(point.x, point.y, point.z);
        surfaceColorList.push(r, g, b);
        surfaceCountryIndexList.push(countryIndex);
        coords.push(point.x, point.y, point.z);
        cColors.push(r, g, b);
      });

      countryPositions.set(countryIndex, coords);
      countryColors.set(countryIndex, cColors);
    });

    const surfacePositions = new Float32Array(surfacePositionList);
    const surfaceColors = new Float32Array(surfaceColorList);
    const surfaceCountryIndices = Uint16Array.from(surfaceCountryIndexList);

    const surfaceGeometry = new THREE.BufferGeometry();
    surfaceGeometry.setAttribute('position', new THREE.BufferAttribute(surfacePositions, 3));
    surfaceGeometry.setAttribute('color', new THREE.BufferAttribute(surfaceColors, 3));

    const surfaceMaterial = new THREE.PointsMaterial({
      map: dotTexture,
      alphaTest: 0.35,
      size: 0.0088,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const surfaceField = new THREE.Points(surfaceGeometry, surfaceMaterial);
    surfaceField.renderOrder = 3;

    const surfaceGlowMaterial = new THREE.PointsMaterial({
      map: dotTexture,
      alphaTest: 0.05,
      size: 0.0128,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const surfaceGlowField = new THREE.Points(surfaceGeometry.clone(), surfaceGlowMaterial);
    surfaceGlowField.renderOrder = 2;

    const boundaryPositionList: number[] = [];
    boundaryDots.forEach(([lat, lon], seed) => {
      const normal = latLonToVector(THREE, lat, lon);
      createBoundaryCluster(seed).forEach(([offsetX, offsetY]) => {
        const point = offsetPointOnSphere(THREE, normal, offsetX, offsetY, 1.616);
        boundaryPositionList.push(point.x, point.y, point.z);
      });
    });

    const boundaryPositions = new Float32Array(boundaryPositionList);

    const boundaryGeometry = new THREE.BufferGeometry();
    boundaryGeometry.setAttribute('position', new THREE.BufferAttribute(boundaryPositions, 3));

    const boundaryMaterial = new THREE.PointsMaterial({
      map: dotTexture,
      alphaTest: 0.32,
      color: 0xb8e8ff,
      size: 0.0032,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const boundaryField = new THREE.Points(boundaryGeometry, boundaryMaterial);
    boundaryField.renderOrder = 5;

    const boundaryGlowMaterial = new THREE.PointsMaterial({
      map: dotTexture,
      alphaTest: 0.05,
      color: 0x2fe8ff,
      size: 0.005,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const boundaryGlowField = new THREE.Points(boundaryGeometry.clone(), boundaryGlowMaterial);
    boundaryGlowField.renderOrder = 4;

    const hoverCountryGeometry = new THREE.BufferGeometry();
    hoverCountryGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(0), 3),
    );
    hoverCountryGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(0), 3));
    const hoverCountryMaterial = new THREE.PointsMaterial({
      map: dotTexture,
      alphaTest: 0.18,
      vertexColors: true,
      size: 0.015,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const hoverCountryField = new THREE.Points(hoverCountryGeometry, hoverCountryMaterial);
    hoverCountryField.renderOrder = 6;
    hoverCountryField.visible = false;
    hoverCountryField.frustumCulled = false;

    globeGroup.add(
      surfaceGlowField,
      surfaceField,
      boundaryGlowField,
      boundaryField,
      hoverCountryField,
    );

    this.surfaceField = surfaceField;
    this.surfaceGlowField = surfaceGlowField;
    this.boundaryField = boundaryField;
    this.boundaryGlowField = boundaryGlowField;
    this.surfaceMaterial = surfaceMaterial;
    this.surfaceGlowMaterial = surfaceGlowMaterial;
    this.boundaryMaterial = boundaryMaterial;
    this.boundaryGlowMaterial = boundaryGlowMaterial;
    this.hoverCountryField = hoverCountryField;
    this.hoverCountryMaterial = hoverCountryMaterial;
    this.surfaceCountryIndices = surfaceCountryIndices;
    this.surfacePositionsByCountry = new Map(
      [...countryPositions.entries()].map(([countryIndex, coords]) => [
        countryIndex,
        new Float32Array(coords),
      ]),
    );
    this.surfaceColorsByCountry = new Map(
      [...countryColors.entries()].map(([countryIndex, cs]) => [
        countryIndex,
        new Float32Array(cs),
      ]),
    );
  }

  private createDotTexture(THREE: ThreeModule): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (!context) {
      return new THREE.CanvasTexture(canvas);
    }

    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.56, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.72, 'rgba(255,255,255,0.88)');
    gradient.addColorStop(0.86, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(0.95, 'rgba(255,255,255,0.12)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
  }

  private getFlagRaster(
    flag: string,
    fallbackColor: readonly [number, number, number],
  ): FlagRaster {
    const cached = this.flagRasters.get(flag);
    if (cached) {
      return cached;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 176;
    const context = canvas.getContext('2d');
    if (!context) {
      const emptyRaster: FlagRaster = {
        data: new Uint8ClampedArray(canvas.width * canvas.height * 4),
        width: canvas.width,
        height: canvas.height,
        minX: 0,
        maxX: canvas.width - 1,
        minY: 0,
        maxY: canvas.height - 1,
        fallback: fallbackColor,
      };
      this.flagRasters.set(flag, emptyRaster);
      return emptyRaster;
    }

    context.save();
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '148px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    context.fillText(flag, 128, 88);
    context.restore();

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const bounds = findOpaqueBounds(imageData.data, canvas.width, canvas.height);
    const fallback = bounds
      ? averageOpaqueColor(imageData.data, canvas.width, bounds)
      : fallbackColor;
    const raster: FlagRaster = {
      data: imageData.data,
      width: canvas.width,
      height: canvas.height,
      minX: bounds?.minX ?? 0,
      maxX: bounds?.maxX ?? canvas.width - 1,
      minY: bounds?.minY ?? 0,
      maxY: bounds?.maxY ?? canvas.height - 1,
      fallback,
    };

    this.flagRasters.set(flag, raster);
    return raster;
  }

  private createStarField(THREE: ThreeModule): Points {
    const starCount = 2100;
    const positions = new Float32Array(starCount * 3);

    for (let index = 0; index < starCount; index += 1) {
      const radius = 8 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi);
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xbfe8ff,
      transparent: true,
      opacity: 0.68,
      size: 0.028,
      sizeAttenuation: true,
      depthWrite: false,
    });
    return new THREE.Points(geometry, material);
  }

  private startLoop(): void {
    const frame = () => {
      if (this.disposed || !this.renderer || !this.scene || !this.camera || !this.three) {
        return;
      }

      this.controls?.update();

      const sizeScale = this.getSizeScale();
      this.updateMarkerVisibility(sizeScale);

      if (this.starField) {
        this.starField.rotation.y += 0.00018;
        this.starField.rotation.x += 0.00004;
      }

      if (this.globeGroup) {
        const intro = this.introState.progress;
        const scale = 0.82 + intro * 0.12;
        this.globeGroup.scale.setScalar(scale);
      }

      const shimmer = (Math.sin(performance.now() * 0.00115) + 1) * 0.5;

      if (this.atmosphereMaterial) {
        this.atmosphereMaterial.opacity = 0.012 + this.introState.progress * 0.026;
      }

      if (this.shellMaterial && 'opacity' in this.shellMaterial) {
        this.shellMaterial.opacity = 0.0004 + this.introState.progress * 0.0014;
      }

      if (this.surfaceMaterial) {
        this.surfaceMaterial.opacity = 0.55 + this.introState.progress * 0.45;
        this.surfaceMaterial.size = 0.0088 * sizeScale;
      }

      if (this.surfaceGlowMaterial) {
        this.surfaceGlowMaterial.opacity = 0.03 + this.introState.progress * (0.1 + shimmer * 0.03);
        this.surfaceGlowMaterial.size = 0.0128 * sizeScale;
      }

      if (this.boundaryMaterial) {
        this.boundaryMaterial.opacity = 0.18 + this.introState.progress * 0.32;
        this.boundaryMaterial.size = 0.0032 * sizeScale;
      }

      if (this.boundaryGlowMaterial) {
        this.boundaryGlowMaterial.opacity =
          0.01 + this.introState.progress * (0.026 + shimmer * 0.012);
        this.boundaryGlowMaterial.size = 0.005 * sizeScale;
      }

      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = window.requestAnimationFrame(frame);
    };

    frame();
  }

  private updateMarkerVisibility(sizeScale: number): void {
    const camera = this.camera;
    const renderer = this.renderer;
    if (!camera || !renderer) {
      return;
    }

    this.updateHoveredCountryVisuals(camera, renderer, this.introState.progress, sizeScale);
  }

  private getSizeScale(): number {
    const camera = this.camera;
    if (!camera) {
      return 1;
    }
    const baseDistance = 5.58;
    const distance = Math.max(camera.position.length(), 0.001);
    return Math.pow(distance / baseDistance, 0.72);
  }

  private setHoveredMarker(marker: GlobeMarker | null): void {
    if (this.hoveredMarker === marker) {
      return;
    }

    if (marker) {
      animate(marker, {
        pulseBoost: [0, 0.9, 0],
        duration: 760,
        ease: 'outExpo',
      });
    }

    this.hoveredMarker = marker;
    this.zone.run(() => {
      this.hoveredCountry.set(marker?.country ?? null);
    });
    this.syncHoveredCountryGeometry(marker);
  }

  private findMarkerBySurfaceIndex(index: number): GlobeMarker | null {
    const countryIndex = this.surfaceCountryIndices?.[index];
    return typeof countryIndex === 'number' ? (this.markers[countryIndex] ?? null) : null;
  }

  private syncHoveredCountryGeometry(marker: GlobeMarker | null): void {
    const hoverCountryField = this.hoverCountryField;
    const THREE = this.three;
    if (!hoverCountryField || !THREE) {
      return;
    }

    const geometry = hoverCountryField.geometry as BufferGeometry;
    const positions = marker
      ? (this.surfacePositionsByCountry.get(marker.countryIndex) ?? null)
      : null;
    const colors = marker ? (this.surfaceColorsByCountry.get(marker.countryIndex) ?? null) : null;

    if (!positions || positions.length === 0 || !colors || colors.length === 0) {
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(0), 3));
      geometry.setDrawRange(0, 0);
      hoverCountryField.visible = false;
      return;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setDrawRange(0, positions.length / 3);
    hoverCountryField.visible = true;
  }

  private getMarkerWorldNormal(marker: GlobeMarker): Vector3 {
    const worldNormal = marker.normal.clone();
    if (this.globeGroup) {
      worldNormal.applyQuaternion(this.globeGroup.quaternion);
    }
    return worldNormal.normalize();
  }

  private updateHoveredCountryVisuals(
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
    intro: number,
    sizeScale: number,
  ): void {
    const overlay = this.hoverFlagCardRef()?.nativeElement;
    const hovered = this.hoveredMarker;
    const hoverCountryMaterial = this.hoverCountryMaterial;

    if (!hovered || !hoverCountryMaterial) {
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transform = 'translate3d(-999px, -999px, 0) scale(0.9)';
      }
      if (this.hoverCountryField) {
        this.hoverCountryField.visible = false;
      }
      if (hoverCountryMaterial) {
        hoverCountryMaterial.opacity = 0;
      }
      return;
    }

    const worldNormal = this.getMarkerWorldNormal(hovered);
    const facing = worldNormal.dot(camera.position.clone().normalize());
    const opacity = Math.max(0, this.opacityScale(facing)) * intro;
    const boost = hovered.pulseBoost;

    if (this.hoverCountryField) {
      this.hoverCountryField.visible = opacity > 0.02;
    }
    hoverCountryMaterial.opacity = Math.min(0.35 + opacity * 0.55 + boost * 0.18, 1);
    hoverCountryMaterial.size = (0.0148 + opacity * 0.0052 + boost * 0.005) * sizeScale;

    if (!overlay) {
      return;
    }

    const anchor = worldNormal.clone().multiplyScalar(1.72).project(camera);
    if (anchor.z > 1 || facing <= -0.04) {
      overlay.style.opacity = '0';
      overlay.style.transform = 'translate3d(-999px, -999px, 0) scale(0.92)';
      return;
    }

    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;
    const x = clamp((anchor.x + 1) * 0.5 * width, 56, width - 56);
    const y = clamp((-anchor.y + 1) * 0.5 * height, 64, height - 64);
    overlay.style.opacity = '1';
    overlay.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -122%) scale(${0.96 + opacity * 0.1})`;
  }

  private playIntro(): void {
    this.introState.progress = 0;
    animate(this.introState, {
      progress: 1,
      duration: 1200,
      ease: 'outExpo',
    });
  }

  private playHudIntro(): void {
    const hud = this.hudRef()?.nativeElement;
    if (!hud) {
      return;
    }

    animate(hud, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 720,
      delay: 120,
      ease: 'outExpo',
    });
  }

  private destroy(): void {
    this.disposed = true;

    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.renderer) {
      this.renderer.domElement.removeEventListener('pointermove', this.handlePointerMove);
      this.renderer.domElement.removeEventListener('pointerleave', this.handlePointerLeave);
      this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
      this.renderer.domElement.removeEventListener('pointerup', this.handlePointerUp);
      this.renderer.domElement.removeEventListener('click', this.handleClick);
    }

    this.destroyScene();
    this.hoveredMarker = null;
    this.hoveredCountry.set(null);
  }

  private destroyScene(): void {
    this.controls?.dispose();
    this.controls = null;

    if (this.scene) {
      this.scene.traverse((object) => {
        const candidate = object as unknown as {
          geometry?: BufferGeometry;
          material?: Material | Material[];
        };
        candidate.geometry?.dispose();
        if (candidate.material) {
          this.disposeMaterial(candidate.material);
        }
      });
    }

    this.renderer?.dispose();
    this.canvasHostRef().nativeElement.replaceChildren();

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = null;
    this.pointer = null;
    this.starField = null;
    this.surfaceField = null;
    this.surfaceGlowField = null;
    this.boundaryField = null;
    this.boundaryGlowField = null;
    this.hoverCountryField = null;
    this.globeGroup = null;
    this.atmosphereMaterial = null;
    this.shellMaterial = null;
    this.surfaceMaterial = null;
    this.surfaceGlowMaterial = null;
    this.boundaryMaterial = null;
    this.boundaryGlowMaterial = null;
    this.hoverCountryMaterial = null;
    this.ringMeshes = [];
    this.ringMaterials = [];
    this.markers = [];
    this.dotTexture?.dispose();
    this.dotTexture = null;
    this.flagRasters.clear();
    this.surfaceCountryIndices = null;
    this.surfacePositionsByCountry = new Map();
    this.surfaceColorsByCountry = new Map();
  }

  private disposeMaterial(material: Material | Material[]): void {
    if (Array.isArray(material)) {
      material.forEach((entry) => this.disposeMaterial(entry));
      return;
    }

    material.dispose();
  }
}

async function loadCountries(): Promise<readonly CountryMarker[]> {
  if (countriesCache) {
    return countriesCache;
  }

  const response = await fetch('/data/world-flag-markers.json');
  if (!response.ok) {
    throw new Error(`Country marker request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as CountryMarkerTuple[];
  countriesCache = payload.map(([code, name, lat, lon, flag]) => ({
    code,
    name,
    lat,
    lon,
    flag,
  }));
  return countriesCache;
}

async function loadSurfaceDots(): Promise<readonly SurfaceDotTuple[]> {
  if (surfaceDotsCache) {
    return surfaceDotsCache;
  }

  const response = await fetch('/data/world-country-surface-dots.json');
  if (!response.ok) {
    throw new Error(`Surface dot request failed with status ${response.status}`);
  }

  surfaceDotsCache = (await response.json()) as SurfaceDotTuple[];
  return surfaceDotsCache;
}

async function loadBoundaryDots(): Promise<readonly BoundaryDotTuple[]> {
  if (boundaryDotsCache) {
    return boundaryDotsCache;
  }

  const response = await fetch('/data/world-country-boundary-dots.json');
  if (!response.ok) {
    throw new Error(`Boundary dot request failed with status ${response.status}`);
  }

  boundaryDotsCache = (await response.json()) as BoundaryDotTuple[];
  return boundaryDotsCache;
}

function latLonToVector(THREE: ThreeModule, lat: number, lon: number): Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;

  return new THREE.Vector3(
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ).normalize();
}

function createSurfaceCluster(seed: number): readonly (readonly [number, number])[] {
  const angle = seededRange(seed * 3, 0, Math.PI * 2);
  const innerRadius = 0.0032 + seededRange(seed * 5, -0.0006, 0.0008);
  const outerRadius = 0.0061 + seededRange(seed * 7, -0.0008, 0.0009);
  return [
    [0, 0],
    projectPolar(innerRadius, angle),
    projectPolar(innerRadius, angle + (Math.PI * 2) / 3),
    projectPolar(innerRadius, angle + (Math.PI * 4) / 3),
    projectPolar(outerRadius, angle + Math.PI / 6),
    projectPolar(outerRadius, angle + Math.PI / 6 + (Math.PI * 2) / 3),
    projectPolar(outerRadius, angle + Math.PI / 6 + (Math.PI * 4) / 3),
  ] as const;
}

function createBoundaryCluster(seed: number): readonly (readonly [number, number])[] {
  const angle = seededRange(seed * 17, 0, Math.PI * 2);
  const primary = 0.0022 + seededRange(seed * 19, -0.00035, 0.00045);
  return [[0, 0], projectPolar(primary, angle)] as const;
}

function seededRange(seed: number, min: number, max: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  const normalized = value - Math.floor(value);
  return min + normalized * (max - min);
}

function offsetPointOnSphere(
  THREE: ThreeModule,
  normal: Vector3,
  offsetX: number,
  offsetY: number,
  radius: number,
): Vector3 {
  const reference =
    Math.abs(normal.y) > 0.94 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const tangent = new THREE.Vector3().crossVectors(reference, normal).normalize();
  const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

  return normal
    .clone()
    .addScaledVector(tangent, offsetX)
    .addScaledVector(bitangent, offsetY)
    .normalize()
    .multiplyScalar(radius);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function projectPolar(radius: number, angle: number): readonly [number, number] {
  return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const;
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function normalizeToUnit(value: number, min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max) || Math.abs(max - min) < 1e-6) {
    return 0.5;
  }

  return clamp01((value - min) / (max - min));
}

function createCountryProjectionFrame(
  THREE: ThreeModule,
  lat: number,
  lon: number,
): CountryProjectionFrame {
  const normal = latLonToVector(THREE, lat, lon);
  const theta = ((lon + 180) * Math.PI) / 180;
  const east = new THREE.Vector3(Math.sin(theta), 0, Math.cos(theta)).normalize();
  const tangent =
    east.lengthSq() > 0.0001
      ? east
      : new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), normal).normalize();
  const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

  return {
    normal,
    tangent,
    bitangent,
    minU: Number.POSITIVE_INFINITY,
    maxU: Number.NEGATIVE_INFINITY,
    minV: Number.POSITIVE_INFINITY,
    maxV: Number.NEGATIVE_INFINITY,
  };
}

function projectVectorIntoCountryFrame(
  vector: Vector3,
  frame: CountryProjectionFrame,
): readonly [number, number] {
  return [vector.dot(frame.tangent), vector.dot(frame.bitangent)] as const;
}

function findOpaqueBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): { minX: number; maxX: number; minY: number; maxY: number } | null {
  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha < 18) {
        continue;
      }

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  return maxX >= minX && maxY >= minY ? { minX, maxX, minY, maxY } : null;
}

function averageOpaqueColor(
  data: Uint8ClampedArray,
  width: number,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
): readonly [number, number, number] {
  let red = 0;
  let green = 0;
  let blue = 0;
  let weight = 0;

  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const offset = (y * width + x) * 4;
      const alpha = data[offset + 3] / 255;
      if (alpha < 0.08) {
        continue;
      }

      red += (data[offset] / 255) * alpha;
      green += (data[offset + 1] / 255) * alpha;
      blue += (data[offset + 2] / 255) * alpha;
      weight += alpha;
    }
  }

  if (weight <= 0) {
    return [0.74, 0.84, 0.96] as const;
  }

  return boostFlagColor(red / weight, green / weight, blue / weight);
}

function sampleFlagRasterColor(
  raster: FlagRaster,
  normalizedU: number,
  normalizedV: number,
): readonly [number, number, number] {
  const x = Math.round(lerp(raster.minX, raster.maxX, normalizedU));
  const y = Math.round(lerp(raster.minY, raster.maxY, normalizedV));
  const sample = sampleRasterPixel(raster, x, y);
  return sample ? boostFlagColor(sample[0], sample[1], sample[2]) : raster.fallback;
}

function sampleRasterPixel(
  raster: FlagRaster,
  x: number,
  y: number,
): readonly [number, number, number] | null {
  for (let radius = 0; radius <= 2; radius += 1) {
    for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
      for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
        const px = clamp(x + offsetX, raster.minX, raster.maxX);
        const py = clamp(y + offsetY, raster.minY, raster.maxY);
        const index = (py * raster.width + px) * 4;
        const alpha = raster.data[index + 3] / 255;
        if (alpha < 0.08) {
          continue;
        }

        const red = raster.data[index] / 255;
        const green = raster.data[index + 1] / 255;
        const blue = raster.data[index + 2] / 255;
        return [
          red * alpha + raster.fallback[0] * (1 - alpha),
          green * alpha + raster.fallback[1] * (1 - alpha),
          blue * alpha + raster.fallback[2] * (1 - alpha),
        ] as const;
      }
    }
  }

  return null;
}

function boostFlagColor(
  red: number,
  green: number,
  blue: number,
): readonly [number, number, number] {
  const luma = (red + green + blue) / 3;
  const saturationBoost = 1.36;
  const lift = 0.055;
  const contrast = 1.08;

  return [
    clamp01((luma + (red - luma) * saturationBoost + lift - 0.5) * contrast + 0.5),
    clamp01((luma + (green - luma) * saturationBoost + lift - 0.5) * contrast + 0.5),
    clamp01((luma + (blue - luma) * saturationBoost + lift - 0.5) * contrast + 0.5),
  ] as const;
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}
