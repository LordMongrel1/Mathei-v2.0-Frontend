import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'app-svg-component',
  imports: [],
  templateUrl: './svg-component.html',
  styleUrl: './svg-component.css',
})
export class SvgComponent implements AfterViewInit {

  @Output() animationComplete = new EventEmitter<void>();
  isLeaving = false;

  @ViewChildren('path1, path2, path3, path4, path5, path6')
  logoPaths!: QueryList<ElementRef<SVGGeometryElement>>;

  @ViewChild('welcomeRect')
  welcomeRect!: ElementRef<SVGRectElement>;

  @ViewChild('matheiRect')
  matheiRect!: ElementRef<SVGRectElement>;

  private readonly SVG_WIDTH = 680;
  private readonly MATHEI_TEXT_WIDTH = 220;

  private readonly WELCOME_DELAY    = 0;
  private readonly WELCOME_DURATION = 2000;
  private readonly LOGO_START       = 2300;
  private readonly LOGO_STEP        = 450;
  private readonly MATHEI_DURATION  = 2630;

  // Quanto rimane visibile dopo la fine, prima di uscire
  private readonly LINGER_MS = 900;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    document.fonts.ready.then(() => this.startAnimations());
  }

  private startAnimations(): void {
    this.animateTextReveal(
      this.welcomeRect.nativeElement,
      this.WELCOME_DELAY,
      this.WELCOME_DURATION
    );

    let delay = this.LOGO_START;
    this.logoPaths.forEach((pathRef) => {
      this.animatePath(pathRef.nativeElement as SVGGeometryElement, delay);
      delay += this.LOGO_STEP;
    });

    this.animateTextReveal(
      this.matheiRect.nativeElement,
      this.LOGO_START,
      this.MATHEI_DURATION,
      this.MATHEI_TEXT_WIDTH
    );

    const lastPathDelay = this.LOGO_START + (this.logoPaths.length - 1) * this.LOGO_STEP + 380;
    const matheiEnd     = this.LOGO_START + this.MATHEI_DURATION;
    const totalEnd      = Math.max(lastPathDelay, matheiEnd) + this.LINGER_MS;
    setTimeout(() => this.animationComplete.emit(), totalEnd);
  }

  private animateTextReveal(
    rect: SVGRectElement,
    delay: number,
    duration: number,
    maxWidth: number = this.SVG_WIDTH
  ): void {
    const run = () => {
      let t0: number | null = null;
      const step = (ts: number) => {
        if (!t0) t0 = ts;
        const progress = Math.min((ts - t0) / duration, 1);
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        rect.setAttribute('width', String(maxWidth * eased));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    delay > 0 ? setTimeout(run, delay) : run();
  }

  private animateStroke(el: SVGGeometryElement, delay: number, duration: number): void {
    const length = el.getTotalLength();
    this.renderer.setStyle(el, 'stroke-dasharray', String(length));
    this.renderer.setStyle(el, 'stroke-dashoffset', String(length));
    setTimeout(() => {
      this.renderer.setStyle(el, 'transition', `stroke-dashoffset ${duration}ms linear`);
      this.renderer.setStyle(el, 'stroke-dashoffset', '0');
    }, delay);
  }

  private animatePath(el: SVGGeometryElement, delay: number): void {
    const stroke = el.getAttribute('stroke');
    const hasNoStroke = !stroke || stroke === 'none';
    if (hasNoStroke) {
      this.renderer.setStyle(el, 'opacity', '0');
      setTimeout(() => {
        this.renderer.setStyle(el, 'transition', 'opacity 0.35s ease-in');
        this.renderer.setStyle(el, 'opacity', '1');
      }, delay);
    } else {
      this.animateStroke(el, delay, 380);
    }
  }
}