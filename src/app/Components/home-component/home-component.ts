import { Component } from '@angular/core';
import { SvgComponent } from '../svg-component/svg-component';
import { PlotterComponent } from '../plotter-component/plotter-component';

@Component({
  selector: 'app-home-component',
  imports: [PlotterComponent, SvgComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {

}
