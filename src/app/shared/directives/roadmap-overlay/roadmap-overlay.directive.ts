import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  Renderer2,
  effect,
  inject,
  input,
} from '@angular/core';
import { icon } from '@fortawesome/fontawesome-svg-core';
import { faLockKeyhole } from '@fortawesome/pro-solid-svg-icons';

@Directive({
  selector: '[appRoadmapOverlay]',
})
export class RoadmapOverlayDirective {
  readonly enabled = input(false, { alias: 'appRoadmapOverlay' });
  readonly chip = input('Roadmap', { alias: 'roadmapOverlayChip' });
  readonly title = input('Implementation planned', { alias: 'roadmapOverlayTitle' });
  readonly hint = input('Interactive module is on the roadmap.', {
    alias: 'roadmapOverlayHint',
  });

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private overlayEl: HTMLElement | null = null;
  private chipEl: HTMLElement | null = null;
  private titleEl: HTMLElement | null = null;
  private hintEl: HTMLElement | null = null;
  private hostPositionPatched = false;

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      if (!this.enabled()) {
        this.destroyOverlay();
        return;
      }

      this.ensureOverlay();
      this.syncContent();
    });

    this.destroyRef.onDestroy(() => this.destroyOverlay());
  }

  private ensureOverlay(): void {
    if (this.overlayEl) {
      return;
    }

    const host = this.hostRef.nativeElement;
    const computedStyle = window.getComputedStyle(host);
    if (computedStyle.position === 'static' && !host.style.position) {
      this.renderer.setStyle(host, 'position', 'relative');
      this.hostPositionPatched = true;
    }

    const overlay = this.createElement('div', {
      position: 'absolute',
      inset: '0',
      zIndex: '30',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '18px',
      borderRadius: 'inherit',
      overflow: 'hidden',
    });
    this.renderer.setAttribute(overlay, 'aria-hidden', 'true');

    const veil = this.createElement('div', {
      position: 'absolute',
      inset: '0',
      borderRadius: 'inherit',
      background:
        'linear-gradient(180deg, rgb(10 12 16 / 0.16), rgb(10 12 16 / 0.34)), linear-gradient(135deg, rgb(255 255 255 / 0.14), rgb(255 255 255 / 0.04) 42%, rgb(255 255 255 / 0.09))',
      backdropFilter: 'blur(10px) saturate(0.74)',
      WebkitBackdropFilter: 'blur(10px) saturate(0.74)',
      boxShadow:
        'inset 0 1px 0 rgb(255 255 255 / 0.16), inset 0 -18px 40px rgb(0 0 0 / 0.18)',
    });

    const glow = this.createElement('div', {
      position: 'absolute',
      inset: '0',
      borderRadius: 'inherit',
      background:
        'radial-gradient(circle at 50% 30%, rgb(255 255 255 / 0.16), transparent 30%), radial-gradient(circle at 50% 52%, rgb(var(--card-accent-rgb, 184 213 110) / 0.18), transparent 42%)',
      opacity: '0.92',
    });

    const content = this.createElement('div', {
      position: 'relative',
      zIndex: '1',
      display: 'grid',
      justifyItems: 'center',
      gap: '14px',
      textAlign: 'center',
    });

    const seal = this.createElement('div', {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      width: '96px',
      height: '96px',
      borderRadius: '50%',
      background:
        'linear-gradient(180deg, rgb(255 255 255 / 0.18), rgb(255 255 255 / 0.05)), rgb(12 15 20 / 0.42)',
      border: '1px solid rgb(255 255 255 / 0.18)',
      boxShadow:
        '0 18px 34px rgb(0 0 0 / 0.22), 0 0 0 1px rgb(var(--card-accent-rgb, 184 213 110) / 0.08), inset 0 1px 0 rgb(255 255 255 / 0.2)',
    });

    const sealRing = this.createElement('div', {
      position: 'absolute',
      inset: '8px',
      borderRadius: '50%',
      border: '1px solid rgb(var(--card-accent-rgb, 184 213 110) / 0.22)',
      boxShadow: 'inset 0 0 22px rgb(var(--card-accent-rgb, 184 213 110) / 0.08)',
    });

    const iconWrapper = this.createElement('span', {
      display: 'grid',
      placeItems: 'center',
      width: '40px',
      height: '40px',
      color: 'rgb(255 255 255 / 0.94)',
      filter: 'drop-shadow(0 3px 12px rgb(0 0 0 / 0.28))',
    });
    this.renderer.setProperty(iconWrapper, 'innerHTML', icon(faLockKeyhole).html.join(''));
    const iconSvg = iconWrapper.querySelector('svg');
    if (iconSvg) {
      this.applyStyles(iconSvg, {
        width: '34px',
        height: '34px',
      });
    }

    const copy = this.createElement('div', {
      display: 'grid',
      justifyItems: 'center',
      gap: '6px',
      maxWidth: '220px',
    });

    const chip = this.createElement('span', {
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: '24px',
      padding: '0 10px',
      borderRadius: '999px',
      background: 'rgb(255 255 255 / 0.14)',
      border: '1px solid rgb(255 255 255 / 0.12)',
      color: 'rgb(255 255 255 / 0.9)',
      fontSize: '10px',
      fontWeight: '700',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
    });

    const title = this.createElement('strong', {
      color: 'rgb(255 255 255 / 0.96)',
      fontSize: '15px',
      lineHeight: '1.15',
      letterSpacing: '-0.04em',
      textWrap: 'balance',
    });

    const hint = this.createElement('span', {
      color: 'rgb(255 255 255 / 0.74)',
      fontSize: '11px',
      lineHeight: '1.4',
      textWrap: 'balance',
    });

    this.renderer.appendChild(seal, sealRing);
    this.renderer.appendChild(seal, iconWrapper);
    this.renderer.appendChild(copy, chip);
    this.renderer.appendChild(copy, title);
    this.renderer.appendChild(copy, hint);
    this.renderer.appendChild(content, seal);
    this.renderer.appendChild(content, copy);
    this.renderer.appendChild(overlay, veil);
    this.renderer.appendChild(overlay, glow);
    this.renderer.appendChild(overlay, content);
    this.renderer.appendChild(host, overlay);

    this.overlayEl = overlay;
    this.chipEl = chip;
    this.titleEl = title;
    this.hintEl = hint;
  }

  private syncContent(): void {
    if (!this.chipEl || !this.titleEl || !this.hintEl) {
      return;
    }

    this.renderer.setProperty(this.chipEl, 'textContent', this.chip());
    this.renderer.setProperty(this.titleEl, 'textContent', this.title());
    this.renderer.setProperty(this.hintEl, 'textContent', this.hint());
  }

  private destroyOverlay(): void {
    if (this.overlayEl) {
      this.renderer.removeChild(this.hostRef.nativeElement, this.overlayEl);
    }

    if (this.hostPositionPatched) {
      this.renderer.removeStyle(this.hostRef.nativeElement, 'position');
      this.hostPositionPatched = false;
    }

    this.overlayEl = null;
    this.chipEl = null;
    this.titleEl = null;
    this.hintEl = null;
  }

  private createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    styles: Record<string, string>,
  ): HTMLElementTagNameMap[K] {
    const element = this.renderer.createElement(tagName) as HTMLElementTagNameMap[K];
    this.applyStyles(element, styles);
    return element;
  }

  private applyStyles(element: Element, styles: Record<string, string>): void {
    for (const [property, value] of Object.entries(styles)) {
      this.renderer.setStyle(element, property, value);
    }
  }
}
