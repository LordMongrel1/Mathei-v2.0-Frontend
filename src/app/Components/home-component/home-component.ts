import { Component, ElementRef, ViewChild } from '@angular/core';
import { SvgComponent } from '../svg-component/svg-component';
import { PlotterComponent } from '../plotter-component/plotter-component';
import { KeyboardComponent } from '../keyboard-component/keyboard-component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-component',
  imports: [KeyboardComponent, CommonModule, FormsModule, PlotterComponent, SvgComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
}
