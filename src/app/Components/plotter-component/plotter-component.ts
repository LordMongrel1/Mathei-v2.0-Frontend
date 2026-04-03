import { AfterViewInit, Component, HostListener } from '@angular/core';
import * as JXG from 'jsxgraph';
import { LatexSenderService } from '../../Services/latex-sender-service';

@Component({
  selector: 'app-plotter-component',
  imports: [],
  templateUrl: './plotter-component.html',
  styleUrl: './plotter-component.css',
})
export class PlotterComponent implements AfterViewInit {
  plotFunction: string = 'Math.sqrt(Math.pow(x, 3) - Math.pow(x, 2)) / Math.log(x - 1)';

  ngAfterViewInit() {
    const board = JXG.JSXGraph.initBoard('jxgbox', { 
        boundingbox: [-16, 8, 16, -8], // [Sinistra, Alto, Destra, Basso]
        axis: true,
        showCopyright: false,

        pan: {
            enabled: true,   // Permette di trascinare il grafico con il mouse
            needShift: false, // Se TRUE, devi premere Shift per muoverti. Metti FALSE per muoverti liberamente.
            needTwoFingers: true // Per i dispositivi touch
        },
        zoom: {
            wheel: true,      // Permette di zoomare con la rotella del mouse
            needShift: false  // Se TRUE, devi premere Shift per zoomare
        },
        
        showNavigation: true

    });

    const mathFunction = (x: number) => {
      return this.plotFunction;
    };

    board.create('functiongraph', [mathFunction], { 
        strokeColor: 'blue', 
        strokeWidth: 3,
        jumpOut: { padding: 10 } 
    });
  }

  constructor(private latexSender: LatexSenderService) {
    this.plotFunction = this.latexSender.getData();
  }
}