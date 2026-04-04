import { Component, ElementRef, ViewChild } from '@angular/core';
import { PlotterComponent } from '../plotter-component/plotter-component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-component',
  imports: [CommonModule, FormsModule, PlotterComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
}
