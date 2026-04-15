import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

type ThreeModule = typeof import('three');

const VERTEX_SHADER = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float iTime;
  uniform vec3 iResolution;
  uniform vec3 uColor;
  uniform float uPositionX;
  uniform float uPositionY;
  uniform float uScale;
  uniform float uEffectRadius;
  uniform float uEffectBoost;
  uniform float uEdgeMin;
  uniform float uEdgeMax;
  uniform float uFalloffPower;
  uniform float uNoiseScale;
  uniform float uWidthFactor;
  uniform float uWaveAmount;
  uniform float uBranchIntensity;
  uniform float uVerticalExtent;
  uniform float uHorizontalExtent;
  uniform float uSeed;

  vec3 random3(vec3 c) {
    float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));
    vec3 r;
    r.z = fract(512.0 * j);
    j *= .125;
    r.x = fract(512.0 * j);
    j *= .125;
    r.y = fract(512.0 * j);
    return r - 0.5;
  }

  const float F3 = 0.3333333;
  const float G3 = 0.1666667;

  float simplex3d(vec3 p) {
    vec3 s = floor(p + dot(p, vec3(F3)));
    vec3 x = p - s + dot(s, vec3(G3));

    vec3 e = step(vec3(0.0), x - x.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);

    vec3 x1 = x - i1 + G3;
    vec3 x2 = x - i2 + 2.0 * G3;
    vec3 x3 = x - 1.0 + 3.0 * G3;

    vec4 w, d;

    w.x = dot(x, x);
    w.y = dot(x1, x1);
    w.z = dot(x2, x2);
    w.w = dot(x3, x3);

    w = max(0.6 - w, 0.0);

    d.x = dot(random3(s), x);
    d.y = dot(random3(s + i1), x1);
    d.z = dot(random3(s + i2), x2);
    d.w = dot(random3(s + 1.0), x3);

    w *= w;
    w *= w;
    d *= w;

    return dot(d, vec4(52.0));
  }

  const mat3 rot1 = mat3(-0.37, 0.36, 0.85, -0.14, -0.93, 0.34, 0.92, 0.01, 0.4);
  const mat3 rot2 = mat3(-0.55, -0.39, 0.74, 0.33, -0.91, -0.24, 0.77, 0.12, 0.63);
  const mat3 rot3 = mat3(-0.71, 0.52, -0.47, -0.08, -0.72, -0.68, -0.7, -0.45, 0.56);

  float simplex3d_fractal(vec3 m) {
    return 0.5333333 * simplex3d(m * rot1)
      + 0.2666667 * simplex3d(2.0 * m * rot2)
      + 0.1333333 * simplex3d(4.0 * m * rot3)
      + 0.0666667 * simplex3d(8.0 * m);
  }

  #define NIGHTSPEEDBONUS 1.25
  #define SHAPE 0
  #define BREATHWILDNESS 1
  #define PI 3.14159265359

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float time = 28.22 + NIGHTSPEEDBONUS * iTime;
    float bignessScale = 1.0 / uNoiseScale;

    vec3 seedShift = vec3(
      fract(uSeed * 0.173),
      fract(uSeed * 0.371),
      fract(uSeed * 0.527)
    );

    vec2 uv = (fragCoord.xy / iResolution.xy) * 2.0 - 1.0;
    float aspect = iResolution.x / iResolution.y;
    uv.x *= aspect;

    float effectiveScale = max(uScale, 0.5);
    uv = uv / effectiveScale;

    float xOffset = mix(-0.18, 0.18, uPositionX);
    float yOffset = mix(-0.3, 0.8, uPositionY);
    uv.x -= xOffset;
    uv.y -= yOffset;

    uv.y *= uVerticalExtent;
    uv.x *= uHorizontalExtent;

    vec2 p = (uv / aspect + 1.0) * 0.5 * iResolution.y / iResolution.y;
    p.x *= aspect;

    vec2 positionFromCenter = uv;
    positionFromCenter /= uEffectRadius;
    positionFromCenter.x /= uWidthFactor;
    float positionFromBottom = 0.5 * (positionFromCenter.y + 1.0);

    vec2 waveOffset = vec2(0.0);
    waveOffset.x += positionFromBottom * sin(4.0 * positionFromCenter.y - 4.0 * time);
    waveOffset.x += 0.1 * positionFromBottom * sin(4.0 * positionFromCenter.x - 1.561 * time);

    waveOffset.x += uBranchIntensity * 0.15 * sin(8.0 * positionFromCenter.y + time * 2.0 + seedShift.x * 9.0);
    waveOffset.x += uBranchIntensity * 0.1 * sin(12.0 * positionFromCenter.y - time * 1.5 + seedShift.y * 7.0);
    waveOffset.y += uBranchIntensity * 0.08 * sin(6.0 * positionFromCenter.x + time * 1.8 + seedShift.z * 5.0);

    positionFromCenter += uWaveAmount * waveOffset;

    float flameTaper = smoothstep(-0.12, 0.92, positionFromCenter.y);
    positionFromCenter.x *= mix(1.0, 1.2, flameTaper);
    positionFromCenter.y *= mix(0.98, 1.08, flameTaper);

    if (SHAPE == 0) {
      positionFromCenter.x += positionFromCenter.x / (1.0 - (positionFromCenter.y));
    } else if (SHAPE == 1) {
      positionFromCenter.x += positionFromCenter.x * positionFromBottom;
    } else if (SHAPE == 2) {
      positionFromCenter.x += sign(positionFromCenter.x) * positionFromBottom;
    }

    float effectMask = clamp(1.0 - length(positionFromCenter), 0.0, 1.0);
    effectMask = 1.0 - pow(1.0 - effectMask, uFalloffPower);

    vec3 p3 = bignessScale * 0.25 * vec3(p.x, p.y, 0.0)
      + vec3(seedShift.xy * 0.8, seedShift.z * 0.6)
      + vec3(0.0, -time * 0.1, time * 0.025);

    float noise = simplex3d_fractal(p3 * 32.0);
    noise += 0.18 * simplex3d(p3 * 64.0 + vec3(time * 0.05, time * 0.03, seedShift.x));
    noise += 0.08 * simplex3d(p3 * 128.0 - vec3(time * 0.08, seedShift.y, time * 0.04));
    noise = 0.5 + 0.5 * noise;

    vec3 finalColor = vec3(0.0);
    float finalAlpha = 0.0;

    float value = effectMask * noise;
    value += uEffectBoost * effectMask;

    if (BREATHWILDNESS == 1) {
      float edge = mix(uEdgeMin, uEdgeMax, pow(0.5 * (positionFromCenter.y + 1.0), 1.2));
      float edgedValue = clamp(value - edge, 0.0, 1.0);
      float steppedValue = smoothstep(edge, edge + 0.1, value);
      float highlight = 1.0 - edgedValue;
      float repeatedValue = highlight;

      p3 = bignessScale * 0.1 * vec3(p.x, p.y, 0.0)
        + vec3(seedShift.z, seedShift.x, seedShift.y)
        + vec3(0.0, -time * 0.01, time * 0.025);

      noise = simplex3d(p3 * 32.0);
      noise = 0.5 + 0.5 * noise;
      repeatedValue = mix(repeatedValue, noise, 0.65);

      repeatedValue = 0.5 * sin(6.0 * PI * (1.0 - pow(1.0 - repeatedValue, 1.8)) - 0.5 * PI) + 0.5;
      float steppedLines = smoothstep(0.968, 1.0, pow(repeatedValue, 10.0));
      steppedLines = mix(steppedLines, 0.0, 0.8 - noise);
      highlight = max(steppedLines, highlight);
      highlight = pow(highlight, 2.0);

      vec3 effectHighlightColor = mix(uColor * 0.82, uColor * 1.52, p.y);
      float whiteFlash = sin(time * 3.0 + seedShift.x * 6.0);
      whiteFlash = pow(max(whiteFlash, 0.0), 4.0);
      effectHighlightColor += vec3(0.42, 0.24, 0.08) * whiteFlash;

      vec3 effectBodyColor = mix(uColor * 0.72, uColor * 1.02, p.y);

      finalColor = effectHighlightColor * (steppedValue * highlight);
      finalColor += effectBodyColor * steppedValue;

      float brightness = dot(finalColor, vec3(0.299, 0.587, 0.114));
      float alphaBoost = smoothstep(0.0, 0.3, brightness);
      finalAlpha = steppedValue * mix(0.24, 0.82, alphaBoost);
    }

    fragColor = vec4(finalColor, finalAlpha);
  }

  void main() {
    vec4 color = vec4(0.0);
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
  }
`;

function hexToRgb(hex: string): { readonly r: number; readonly g: number; readonly b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 1, g: 0.6235, b: 0.9882 };
  }

  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

function seedToFloat(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
}

@Component({
  selector: 'app-shader-card-effect',
  templateUrl: './shader-card-effect.html',
  styleUrl: './shader-card-effect.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShaderCardEffect implements AfterViewInit {
  readonly speed = input(0.82);
  readonly autoPlay = input(true);
  readonly color = input('#ff9ffc');
  readonly positionX = input(0.82);
  readonly positionY = input(0.18);
  readonly scale = input(3);
  readonly effectRadius = input(0.9);
  readonly effectBoost = input(0.32);
  readonly edgeMin = input(0.02);
  readonly edgeMax = input(0.42);
  readonly falloffPower = input(2.2);
  readonly noiseScale = input(1.5);
  readonly widthFactor = input(0.5);
  readonly waveAmount = input(0.4);
  readonly branchIntensity = input(0.45);
  readonly verticalExtent = input(1.45);
  readonly horizontalExtent = input(1.5);
  readonly blur = input(4);
  readonly opacity = input(0.56);
  readonly seed = input('insane');

  readonly canvasOpacity = computed(() => String(this.opacity()));
  readonly canvasFilter = computed(() =>
    this.blur() > 0 ? `blur(${this.blur().toFixed(1)}px)` : null,
  );

  private readonly canvasHostRef = viewChild.required<ElementRef<HTMLDivElement>>('canvasHost');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly inViewport = signal(true);
  private readonly documentVisible = signal(true);
  private readonly reducedMotion = signal(false);
  private readonly canAnimate = computed(
    () => this.autoPlay() && this.inViewport() && this.documentVisible() && !this.reducedMotion(),
  );

  private three: ThreeModule | null = null;
  private renderer: InstanceType<ThreeModule['WebGLRenderer']> | null = null;
  private scene: InstanceType<ThreeModule['Scene']> | null = null;
  private camera: InstanceType<ThreeModule['OrthographicCamera']> | null = null;
  private geometry: InstanceType<ThreeModule['PlaneGeometry']> | null = null;
  private material: InstanceType<ThreeModule['ShaderMaterial']> | null = null;
  private mesh: InstanceType<ThreeModule['Mesh']> | null = null;
  private uniforms: Record<string, { value: unknown }> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private rafId = 0;
  private lastFrameTime = 0;
  private startTime = 0;
  private needsRender = true;
  private hostElement: HTMLDivElement | null = null;
  private mediaQuery: MediaQueryList | null = null;
  private mediaQueryListener: ((event: MediaQueryListEvent) => void) | null = null;
  private visibilityListener: (() => void) | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion.set(this.mediaQuery.matches);
      this.mediaQueryListener = (event: MediaQueryListEvent) =>
        this.reducedMotion.set(event.matches);
      this.mediaQuery.addEventListener('change', this.mediaQueryListener);

      this.visibilityListener = () =>
        this.documentVisible.set(document.visibilityState !== 'hidden');
      document.addEventListener('visibilitychange', this.visibilityListener);
      this.documentVisible.set(document.visibilityState !== 'hidden');
    }

    effect(() => {
      const uniforms = this.uniforms;
      const color = hexToRgb(this.color());
      const seed = seedToFloat(this.seed());
      const positionX = this.positionX();
      const positionY = this.positionY();
      const scale = this.scale();
      const effectRadius = this.effectRadius();
      const effectBoost = this.effectBoost();
      const edgeMin = this.edgeMin();
      const edgeMax = this.edgeMax();
      const falloffPower = this.falloffPower();
      const noiseScale = this.noiseScale();
      const widthFactor = this.widthFactor();
      const waveAmount = this.waveAmount();
      const branchIntensity = this.branchIntensity();
      const verticalExtent = this.verticalExtent();
      const horizontalExtent = this.horizontalExtent();
      this.speed();
      this.canAnimate();

      if (!uniforms) {
        return;
      }

      const uColor = uniforms['uColor']?.value as { set: (x: number, y: number, z: number) => void };
      uColor?.set(color.r, color.g, color.b);
      uniforms['uPositionX'].value = positionX;
      uniforms['uPositionY'].value = positionY;
      uniforms['uScale'].value = scale;
      uniforms['uEffectRadius'].value = effectRadius;
      uniforms['uEffectBoost'].value = effectBoost;
      uniforms['uEdgeMin'].value = edgeMin;
      uniforms['uEdgeMax'].value = edgeMax;
      uniforms['uFalloffPower'].value = falloffPower;
      uniforms['uNoiseScale'].value = noiseScale;
      uniforms['uWidthFactor'].value = widthFactor;
      uniforms['uWaveAmount'].value = waveAmount;
      uniforms['uBranchIntensity'].value = branchIntensity;
      uniforms['uVerticalExtent'].value = verticalExtent;
      uniforms['uHorizontalExtent'].value = horizontalExtent;
      uniforms['uSeed'].value = seed;
      this.needsRender = true;
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await this.initWebGl();
  }

  private async initWebGl(): Promise<void> {
    const host = this.canvasHostRef().nativeElement;
    this.hostElement = host;
    const THREE = await import('three');
    this.three = THREE;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    });
    renderer.setClearColor(0x000000, 0);

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = host.getBoundingClientRect();
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(rect.width, rect.height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const color = hexToRgb(this.color());

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(rect.width * pixelRatio, rect.height * pixelRatio, 1) },
      uColor: { value: new THREE.Vector3(color.r, color.g, color.b) },
      uPositionX: { value: this.positionX() },
      uPositionY: { value: this.positionY() },
      uScale: { value: this.scale() },
      uEffectRadius: { value: this.effectRadius() },
      uEffectBoost: { value: this.effectBoost() },
      uEdgeMin: { value: this.edgeMin() },
      uEdgeMax: { value: this.edgeMax() },
      uFalloffPower: { value: this.falloffPower() },
      uNoiseScale: { value: this.noiseScale() },
      uWidthFactor: { value: this.widthFactor() },
      uWaveAmount: { value: this.waveAmount() },
      uBranchIntensity: { value: this.branchIntensity() },
      uVerticalExtent: { value: this.verticalExtent() },
      uHorizontalExtent: { value: this.horizontalExtent() },
      uSeed: { value: seedToFloat(this.seed()) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      blending: THREE.NormalBlending,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
    this.uniforms = uniforms;
    this.startTime = performance.now();
    this.lastFrameTime = 0;
    this.needsRender = true;

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(host);

    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.inViewport.set(entry?.isIntersecting ?? true);
        this.needsRender = true;
      },
      { threshold: 0.01 },
    );
    this.intersectionObserver.observe(host);

    this.rafId = window.requestAnimationFrame((time) => this.renderLoop(time));
  }

  private renderLoop(now: number): void {
    this.rafId = window.requestAnimationFrame((next) => this.renderLoop(next));

    if (!this.renderer || !this.scene || !this.camera || !this.uniforms) {
      return;
    }

    const shouldAnimate = this.canAnimate();
    const minFrameInterval = 1000 / 48;
    if (shouldAnimate && now - this.lastFrameTime < minFrameInterval) {
      return;
    }

    if (!shouldAnimate && !this.needsRender) {
      return;
    }

    if (shouldAnimate) {
      this.uniforms['iTime'].value = ((now - this.startTime) / 1000) * this.speed();
    }

    this.renderer.render(this.scene, this.camera);
    this.lastFrameTime = now;
    this.needsRender = false;
  }

  private handleResize(): void {
    if (!this.renderer || !this.uniforms) {
      return;
    }

    const host = this.canvasHostRef().nativeElement;
    const rect = host.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(rect.width, rect.height, false);
    const resolution = this.uniforms['iResolution'].value as { set: (x: number, y: number, z: number) => void };
    resolution?.set(rect.width * pixelRatio, rect.height * pixelRatio, 1);
    this.needsRender = true;
  }

  private cleanup(): void {
    if (this.visibilityListener) {
      document.removeEventListener('visibilitychange', this.visibilityListener);
      this.visibilityListener = null;
    }

    if (this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
      this.mediaQueryListener = null;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;

    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }

    if (this.scene && this.mesh) {
      this.scene.remove(this.mesh);
    }
    this.geometry?.dispose();
    this.material?.dispose();
    this.renderer?.dispose();

    const domElement = this.renderer?.domElement;
    const host = this.hostElement;
    if (domElement && host?.contains(domElement)) {
      host.removeChild(domElement);
    }

    this.mesh = null;
    this.material = null;
    this.geometry = null;
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.uniforms = null;
    this.hostElement = null;
  }
}
