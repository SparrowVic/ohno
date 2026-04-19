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
      animation: 'ohno-fade-scale 420ms var(--ease-out-expo) both',
    });
    this.renderer.setAttribute(overlay, 'aria-hidden', 'true');

    const veil = this.createElement('div', {
      position: 'absolute',
      inset: '0',
      borderRadius: 'inherit',
      background:
        'linear-gradient(180deg, rgb(8 10 16 / 0.22), rgb(8 10 16 / 0.42)), linear-gradient(135deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.02) 42%, rgb(255 255 255 / 0.06))',
      backdropFilter: 'blur(12px) saturate(0.82)',
      WebkitBackdropFilter: 'blur(12px) saturate(0.82)',
      boxShadow:
        'inset 0 1px 0 rgb(255 255 255 / 0.14), inset 0 -18px 40px rgb(0 0 0 / 0.22)',
    });

    const glow = this.createElement('div', {
      position: 'absolute',
      inset: '0',
      borderRadius: 'inherit',
      background:
        'radial-gradient(circle at 50% 30%, rgb(255 255 255 / 0.14), transparent 32%), radial-gradient(circle at 50% 52%, rgb(var(--card-accent-rgb, 199 229 106) / 0.22), transparent 46%), radial-gradient(circle at 18% 88%, rgb(var(--chrome-accent-alt-rgb) / 0.1), transparent 40%)',
      opacity: '0.94',
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
        'conic-gradient(from 180deg, rgb(var(--card-accent-rgb, 199 229 106) / 0.14), rgb(var(--chrome-accent-alt-rgb) / 0.14), rgb(var(--chrome-accent-rgb) / 0.18), rgb(var(--card-accent-rgb, 199 229 106) / 0.14)), linear-gradient(180deg, rgb(255 255 255 / 0.18), rgb(255 255 255 / 0.05)), rgb(14 17 24 / 0.5)',
      border: '0.5px solid rgb(255 255 255 / 0.2)',
      boxShadow:
        '0 20px 40px rgb(0 0 0 / 0.3), 0 0 0 1px rgb(var(--card-accent-rgb, 199 229 106) / 0.1), 0 0 32px rgb(var(--card-accent-rgb, 199 229 106) / 0.12), inset 0 1px 0 rgb(255 255 255 / 0.22)',
    });

    const sealRing = this.createElement('div', {
      position: 'absolute',
      inset: '8px',
      borderRadius: '50%',
      border: '1px dashed rgb(var(--card-accent-rgb, 199 229 106) / 0.28)',
      boxShadow: 'inset 0 0 22px rgb(var(--card-accent-rgb, 199 229 106) / 0.1)',
      animation: 'roadmap-seal-rotate 18s linear infinite',
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
      padding: '0 11px',
      borderRadius: '999px',
      background:
        'linear-gradient(135deg, rgb(var(--chrome-accent-rgb) / 0.2), rgb(var(--chrome-accent-alt-rgb) / 0.14)), rgb(255 255 255 / 0.04)',
      border: '0.5px solid rgb(var(--chrome-accent-rgb) / 0.36)',
      color: 'rgb(var(--chrome-accent-strong))',
      fontSize: '10px',
      fontWeight: '700',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.08), 0 0 14px rgb(var(--chrome-accent-rgb) / 0.18)',
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
