import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as JXG from 'jsxgraph';
import { create, all } from 'mathjs';
import { KeyboardComponent } from '../keyboard-component/keyboard-component';
import { SideBarComponent } from '../side-bar-component/side-bar-component';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-plotter-component',
  imports: [ KeyboardComponent, SideBarComponent, MatSidenavModule ],
  templateUrl: './plotter-component.html',
  styleUrl: './plotter-component.css',
})
export class PlotterComponent implements AfterViewInit {
  showSidebar: boolean = false;
  showKeyboard: boolean = true;
  board: JXG.Board | undefined;
  graph: any;
  math = create(all);
  plotFunction: string = 'sqrt(pow(x, 3) - pow(x, 2)) / log(x - 1)';

  handleData(data: string) {
    this.updateFunction(data);
  }

  ngAfterViewInit() {
    this.board = JXG.JSXGraph.initBoard('jxgbox', {
      boundingbox: [-16, 8, 16, -8],
      axis: true,
      showCopyright: false,
      pan: { enabled: true, needShift: false, needTwoFingers: true },
      zoom: { wheel: true, needShift: false },
      showNavigation: true
    });

    const mathFunction = (x: number) => {
      try {
        return this.math.evaluate(this.plotFunction, { x });
      } catch {
        return NaN;
      }
    };

    this.board.create('functiongraph', [mathFunction], {
      strokeColor: 'blue',
      strokeWidth: 3,
      jump: true
    });
  }

  updateFunction(newFunc: string) {
    this.plotFunction = newFunc;
    if (this.board) {
      console.log('Updating function to:', newFunc);
      this.board.removeObject(this.graph);
      const mathFunction = (x: number) => {
        try { 
          return this.math.evaluate(this.plotFunction, { x }); 
        } 
        catch { return NaN; }
      };
      this.graph = this.board.create('functiongraph', [mathFunction], {
        strokeColor: 'blue',
        strokeWidth: 3,
        jump: true
      });
    }
  }

  handleSentToBackend($event: boolean) {
    this.showSidebar = $event;
    this.showKeyboard = !$event;
  }
}