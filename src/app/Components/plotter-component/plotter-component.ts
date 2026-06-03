import { AfterViewInit, Component } from '@angular/core';
import * as JXG from 'jsxgraph';
import { KeyboardComponent } from '../keyboard-component/keyboard-component';
import { SideBarComponent } from '../side-bar-component/side-bar-component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '../../auth/auth';
import { Router } from '@angular/router';
import { KeyboardStateService } from '../../Services/keyboard-state-service';
import { MathParserService } from '../../Services/math-parser-service';
import { ToastComponent } from '../toast-component/toast-component';

@Component({
  selector: 'app-plotter-component',
  standalone: true,
  imports: [KeyboardComponent, SideBarComponent, MatSidenavModule, ToastComponent],
  templateUrl: './plotter-component.html',
  styleUrl: './plotter-component.css',
})
export class PlotterComponent implements AfterViewInit {
  showSidebar  = false;
  showKeyboard = true;
  board: JXG.Board | undefined;
  graph: any;
  loggedIn: boolean | undefined;

  constructor(
    private auth:       AuthService,
    private router:     Router,
    private state:      KeyboardStateService,
    private mathParser: MathParserService,
  ) {}

  ngOnInit() {
    this.loggedIn = this.auth.isLoggedIn();
  }

  get plotFunction(): string  { return this.state.plotFunction; }
  set plotFunction(v: string) { this.state.plotFunction = v; }

  goToHistory() { this.router.navigate(['/history']); }

  handleData(data: string) { this.updateFunction(data); }

  ngAfterViewInit() {
    this.board = JXG.JSXGraph.initBoard('jxgbox', {
      boundingbox:    [-16, 8, 16, -8],
      axis:           true,
      showCopyright:  false,
      pan:            { enabled: true, needShift: false, needTwoFingers: true },
      zoom:           { wheel: true, needShift: false },
      showNavigation: true,
    });

    this.board.create('functiongraph', [(x: number) => this.evaluate(x)], {
      strokeColor: '#d04060',
      strokeWidth: 3,
      jump: true,
    });
  }

  updateFunction(newFunc: string) {
    this.plotFunction = this.mathParser.swapLogArgs(newFunc);
    if (!this.board) return;
    this.board.removeObject(this.graph);
    this.graph = this.board.create(
      'functiongraph',
      [(x: number) => this.evaluate(x)],
      { strokeColor: '#d04060', strokeWidth: 3, jump: true }
    );
  }

  handleKeyboard() {
    this.showKeyboard = !this.showKeyboard;
    this.showSidebar  = !this.showSidebar;
  }

  private evaluate(x: number): number {
    try {
      return this.mathParser.evaluate(this.plotFunction, { x });
    } catch {
      return NaN;
    }
  }
}