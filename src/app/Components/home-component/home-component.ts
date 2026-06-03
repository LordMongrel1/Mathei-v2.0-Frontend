import { ChangeDetectorRef, Component } from '@angular/core';
import { PlotterComponent } from '../plotter-component/plotter-component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgComponent } from '../svg-component/svg-component';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, FormsModule, PlotterComponent, SvgComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  private readonly SPLASH_KEY = 'mathei_splash_seen';
  private readonly EXIT_DURATION = 700;

  constructor(private cdr: ChangeDetectorRef) {}

  showSplash   = !sessionStorage.getItem(this.SPLASH_KEY);
  showPlotter  = !!sessionStorage.getItem(this.SPLASH_KEY);

  onSplashComplete(): void {
    sessionStorage.setItem(this.SPLASH_KEY, '1');
    this.showSplash = false;
    setTimeout(() => {
      this.showPlotter = true;
      this.cdr.detectChanges();
    }, this.EXIT_DURATION);
  }
}