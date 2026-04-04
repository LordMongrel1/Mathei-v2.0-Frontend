import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { create, all } from 'mathjs';
import { LatexSenderService } from '../../Services/latex-sender-service';

interface MathSymbol {
  label: string;
  latex: string;
  type: 'number' | 'operator' | 'variable' | 'function';
  offset?: number;
}

interface Token {
  display: string;
  latex: string;
}

@Component({
  selector: 'app-keyboard-component',
  imports: [CommonModule],
  templateUrl: './keyboard-component.html',
  styleUrl: './keyboard-component.css',
})
export class KeyboardComponent {
  math = create(all);
  @Output() sentToBackend = new EventEmitter<boolean>();
  @Output() dataToSend = new EventEmitter<string>();
  tokens: Token[] = [];
  isAdvanced = false;
  isSubscriptMode = false;
  isAltscriptMode = false;
  private altscriptCloseToken: Token | null = null;
  private altscriptCloseTokenStack: Token[] = [];

  constructor(private latexSender: LatexSenderService) {}

  @ViewChild('mathInput') mathInput!: ElementRef;

  get textValue(): string { return this.tokens.map(t => t.display).join(''); }
  get latex():     string { return this.tokens.map(t => t.latex).join('');   }

  toggleAdvanced() { this.isAdvanced = !this.isAdvanced; }

  leftBase: MathSymbol[] = [
    { label: 'x',  latex: 'x',      type: 'variable' },
    { label: 'y',  latex: 'y',      type: 'variable' },
    { label: '²',  latex: '^2',     type: 'function' },
    { label: 'ⁿ',  latex: '^()',    type: 'function', offset: 1 },
    { label: '(',  latex: '(',      type: 'operator' },
    { label: ')',  latex: ')',      type: 'operator' },
    { label: '√',  latex: 'sqrt()', type: 'function', offset: 1 },
    { label: 'π',  latex: 'pi',    type: 'variable' },
  ];

  functions: MathSymbol[] = [
    { label: 'e',        latex: 'e',        type: 'variable' },
    { label: 'exp()',    latex: 'exp()',     type: 'function', offset: 1 },
    { label: 'ln(',      latex: 'log(',     type: 'function', offset: 0 },
    { label: 'logₐ(',   latex: 'log(',     type: 'function', offset: 0 },
    { label: 'sin()',    latex: 'sin()',    type: 'function', offset: 1 },
    { label: 'cos()',    latex: 'cos()',    type: 'function', offset: 1 },
    { label: 'tan()',    latex: 'tan()',    type: 'function', offset: 1 },
    { label: 'cot()',    latex: 'cot()',    type: 'function', offset: 1 },
    { label: 'sec()',    latex: 'sec()',    type: 'function', offset: 1 },
    { label: 'csc()',    latex: 'csc()',    type: 'function', offset: 1 },
    { label: 'arcsin()', latex: 'arcsin()', type: 'function', offset: 1 },
    { label: 'arccos()', latex: 'arccos()', type: 'function', offset: 1 },
    { label: 'arctan()', latex: 'arctan()', type: 'function', offset: 1 },
  ];

  centerPanel: Array<{ label: string; latex: string; offset: number; type: string }> = [
    { label: '7', latex: '7', offset: 0, type: 'number' },
    { label: '8', latex: '8', offset: 0, type: 'number' },
    { label: '9', latex: '9', offset: 0, type: 'number' },
    { label: '÷', latex: '/', offset: 0, type: 'operator' },
    { label: '4', latex: '4', offset: 0, type: 'number' },
    { label: '5', latex: '5', offset: 0, type: 'number' },
    { label: '6', latex: '6', offset: 0, type: 'number' },
    { label: '·', latex: '*', offset: 0, type: 'operator' },
    { label: '1', latex: '1', offset: 0, type: 'number' },
    { label: '2', latex: '2', offset: 0, type: 'number' },
    { label: '3', latex: '3', offset: 0, type: 'number' },
    { label: '−', latex: '-', offset: 0, type: 'operator' },
    { label: '0', latex: '0', offset: 0, type: 'number' },
    { label: '.', latex: '.', offset: 0, type: 'number' },
    { label: '=', latex: '=', offset: 0, type: 'operator' },
    { label: '+', latex: '+', offset: 0, type: 'operator' },
  ];

  subscriptMap: Record<string, string> = {
    '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄',
    '5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
    'x':'ₓ','y':'ᵧ','/':'⁄',
  };

  altscriptMap: Record<string, string> = {
    '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴',
    '5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
    'x':'ˣ','y':'ʸ','/':'⁄',
  };

  private tokenIdxAt(charPos: number): number {
    let pos = 0;
    for (let i = 0; i < this.tokens.length; i++) {
      pos += this.tokens[i].display.length;
      if (pos >= charPos) return i + 1;
    }
    return this.tokens.length;
  }

  private charPosOf(tokenIdx: number): number {
    return this.tokens.slice(0, tokenIdx).reduce((s, t) => s + t.display.length, 0);
  }

  private setCursor(pos: number) {
    const input = this.mathInput.nativeElement;
    setTimeout(() => { input.focus(); input.setSelectionRange(pos, pos); });
  }

  private insertAt(idx: number, symbol: string, latex: string, offset: number) {
    const basePos = this.charPosOf(idx); // posizione char prima della splice

    if (offset > 0) {
      const latOpen  = latex.slice(0, latex.length - offset);
      const latClose = latex.slice(latex.length - offset);

      let dispOpen: string, dispClose: string;
      if (symbol.length > offset) {
        dispOpen  = symbol.slice(0, symbol.length - offset);
        dispClose = symbol.slice(symbol.length - offset);
      } else {
        dispOpen  = symbol;
        dispClose = ')'.repeat(offset);
      }

      const tokOpen:  Token = { display: dispOpen,  latex: latOpen  };
      const tokClose: Token = { display: dispClose, latex: latClose };
      this.tokens.splice(idx, 0, tokOpen, tokClose);
      this.setCursor(basePos + dispOpen.length);

    } else {
      const tok: Token = { display: symbol, latex };
      this.tokens.splice(idx, 0, tok);
      this.setCursor(basePos + tok.display.length);
    }
  }

  handleKey(event: KeyboardEvent) {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    if (event.key === 'Backspace') { this.cancelText(); }
    event.preventDefault();
  }

  addSymbol(symbol: string, latex: string, offset: number) {
    const input  = this.mathInput.nativeElement;
    const cursor = (input.selectionStart as number) ?? this.textValue.length;
    const insIdx = this.tokenIdxAt(cursor);

    if (symbol === 'logₐ(') {
      const tok: Token = { display: 'log', latex: 'log(' };
      this.tokens.splice(insIdx, 0, tok);
      this.isSubscriptMode = true;
      this.setCursor(cursor + tok.display.length);
      return;
    }

    if (symbol === 'ⁿ') {
      if (this.isAltscriptMode && this.altscriptCloseToken) {
        this.altscriptCloseTokenStack.push(this.altscriptCloseToken);
      }
      const open:  Token = { display: '⁽', latex: '^(' };
      const close: Token = { display: '⁾', latex: ')' };
      this.tokens.splice(insIdx, 0, open, close);
      this.altscriptCloseToken = close;
      this.isAltscriptMode = true;
      this.setCursor(cursor + 1);
      return;
    }

    if (this.isSubscriptMode) {
      if (symbol === '(') {
        // '(' chiude il subscript e diventa separatore: display='(' latex=','
        const tok: Token = { display: '(', latex: ',' };
        this.tokens.splice(insIdx, 0, tok);
        this.isSubscriptMode = false;
        this.setCursor(cursor + 1);
        return;
      }
      if (this.subscriptMap[symbol]) {
        const tok: Token = { display: this.subscriptMap[symbol], latex: symbol };
        this.tokens.splice(insIdx, 0, tok);
        this.setCursor(cursor + tok.display.length);
        return;
      }

      this.isSubscriptMode = false;
    }

    if (this.isAltscriptMode && this.altscriptCloseToken) {
      if (this.altscriptMap[symbol]) {
        const closeIdx = this.tokens.indexOf(this.altscriptCloseToken);
        const tok: Token = { display: this.altscriptMap[symbol], latex: symbol };
        this.tokens.splice(closeIdx, 0, tok);
        this.setCursor(this.charPosOf(closeIdx + 1));
        return;
      }

      const outerClose = this.altscriptCloseTokenStack.length > 0
        ? this.altscriptCloseTokenStack[0]
        : this.altscriptCloseToken;
      const afterOuterIdx = this.tokens.indexOf(outerClose) + 1;
      this.isAltscriptMode = false;
      this.altscriptCloseToken = null;
      this.altscriptCloseTokenStack = [];
      this.insertAt(afterOuterIdx, symbol, latex, offset);
      console.log('LaTeX:', this.latex);
      return;
    }

    this.insertAt(insIdx, symbol, latex, offset);
    this.dataToSend.emit(this.latex);
  }

  cancelText() {
    const input  = this.mathInput.nativeElement;
    const cursor = (input.selectionStart as number) ?? this.textValue.length;

    if (cursor === 0 || this.tokens.length === 0) return;

    let pos = 0, tokIdx = this.tokens.length - 1;
    for (let i = 0; i < this.tokens.length; i++) {
      pos += this.tokens[i].display.length;
      if (pos >= cursor) { tokIdx = i; break; }
    }

    const removed = this.tokens[tokIdx];

    if (removed === this.altscriptCloseToken) {
      if (this.altscriptCloseTokenStack.length > 0) {
        this.altscriptCloseToken = this.altscriptCloseTokenStack.pop()!;
      } else {
        this.isAltscriptMode = false;
        this.altscriptCloseToken = null;
      }
    } else {
      const si = this.altscriptCloseTokenStack.indexOf(removed);
      if (si >= 0) this.altscriptCloseTokenStack.splice(si, 1);
    }

    const removedLen = removed.display.length;
    this.tokens.splice(tokIdx, 1);
    this.setCursor(Math.max(0, cursor - removedLen));
    console.log('LaTeX:', this.latex);
  }

  sendToBackend() {
    const realLatex = this.getLatex(this.latex);
    console.log('LaTeX da inviare al backend:', realLatex);
    this.latexSender.setData(realLatex);
    this.sentToBackend.emit(true);
  }

  getLatex(latex: string): string {
    try {
      const node = this.math.parse(latex);
      return node.toTex();
    } catch (error) {
      console.error("Errore nella conversione LaTeX:", error);
      return '';
    }
  }
}