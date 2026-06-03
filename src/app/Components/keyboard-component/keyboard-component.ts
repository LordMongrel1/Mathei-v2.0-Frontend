import {
  ChangeDetectorRef, Component, ElementRef,
  EventEmitter, OnInit, Output, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LatexSenderService } from '../../Services/latex-sender-service';
import { KeyboardStateService } from '../../Services/keyboard-state-service';
import { MathParserService } from '../../Services/math-parser-service';
import { ToastService } from '../../Services/toast-service';

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
  standalone: true,
  imports: [CommonModule],
  templateUrl: './keyboard-component.html',
  styleUrl: './keyboard-component.css',
})
export class KeyboardComponent implements OnInit {
  @Output() sentToBackend = new EventEmitter<boolean>();
  @Output() dataToSend    = new EventEmitter<string>();
  showConfirm = false;
  selectedFile: File | null = null;

  constructor(
    private latexSender: LatexSenderService,
    private state:       KeyboardStateService,
    private mathParser:  MathParserService,
    private cdr:         ChangeDetectorRef,
    private toast:       ToastService,
  ) {}

  // ── State getters/setters (delegano al servizio) ──────────────────────────

  get tokens()                     { return this.state.tokens; }
  set tokens(v: Token[])           { this.state.tokens = v; }

  get isAdvanced()                 { return this.state.isAdvanced; }
  set isAdvanced(v: boolean)       { this.state.isAdvanced = v; }

  get isSubscriptMode()            { return this.state.isSubscriptMode; }
  set isSubscriptMode(v: boolean)  { this.state.isSubscriptMode = v; }

  get isAltscriptMode()            { return this.state.isAltscriptMode; }
  set isAltscriptMode(v: boolean)  { this.state.isAltscriptMode = v; }

  private get altscriptCloseToken()              { return this.state.altscriptCloseToken; }
  private set altscriptCloseToken(v: Token|null) { this.state.altscriptCloseToken = v; }

  private get altscriptCloseTokenStack()         { return this.state.altscriptCloseTokenStack; }
  private set altscriptCloseTokenStack(v: Token[]){ this.state.altscriptCloseTokenStack = v; }

  get canSend():    boolean { return this.tokens.length > 0; }
  get textValue():  string  { return this.tokens.map(t => t.display).join(''); }
  get latex():      string  { return this.tokens.map(t => t.latex).join('');   }

  @ViewChild('mathInput') mathInput!: ElementRef;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit() {
    if (this.state.pendingSend && this.state.tokens.length > 0) {
      this.state.pendingSend = false;
      setTimeout(() => this.sendToBackend(true), 0);
      this.dataToSend.emit(this.latex);
    }
  }

  // ── Simboli tastiera ──────────────────────────────────────────────────────

  leftBase: MathSymbol[] = [
    { label: 'x',  latex: 'x',       type: 'variable' },
    { label: 'y',  latex: 'y',       type: 'variable' },
    { label: '²',  latex: '^2',      type: 'function' },
    { label: 'ⁿ',  latex: '^()',     type: 'function', offset: 1 },
    { label: '(',  latex: '(',       type: 'operator' },
    { label: ')',  latex: ')',       type: 'operator' },
    { label: '√',  latex: 'sqrt()', type: 'function', offset: 1 },
    { label: 'π',  latex: 'pi',     type: 'variable' },
  ];

  functions: MathSymbol[] = [
    { label: 'e',        latex: 'e',       type: 'variable' },
    { label: 'exp()',    latex: 'exp()',    type: 'function', offset: 1 },
    { label: 'ln(',      latex: 'log(',    type: 'function', offset: 0 },
    { label: 'logₐ(',   latex: 'log(',    type: 'function', offset: 0 },
    { label: 'sin()',    latex: 'sin()',   type: 'function', offset: 1 },
    { label: 'cos()',    latex: 'cos()',   type: 'function', offset: 1 },
    { label: 'tan()',    latex: 'tan()',   type: 'function', offset: 1 },
    { label: 'cot()',    latex: 'cot()',   type: 'function', offset: 1 },
    { label: 'sec()',    latex: 'sec()',   type: 'function', offset: 1 },
    { label: 'csc()',    latex: 'csc()',   type: 'function', offset: 1 },
    { label: 'arcsin()', latex: 'asin()', type: 'function', offset: 1 },
    { label: 'arccos()', latex: 'acos()', type: 'function', offset: 1 },
    { label: 'arctan()', latex: 'atan()', type: 'function', offset: 1 },
  ];

  centerPanel: Array<{ label: string; latex: string; offset: number; type: string }> = [
    { label: '7', latex: '7', offset: 0, type: 'number'   },
    { label: '8', latex: '8', offset: 0, type: 'number'   },
    { label: '9', latex: '9', offset: 0, type: 'number'   },
    { label: '÷', latex: '/', offset: 0, type: 'operator' },
    { label: '4', latex: '4', offset: 0, type: 'number'   },
    { label: '5', latex: '5', offset: 0, type: 'number'   },
    { label: '6', latex: '6', offset: 0, type: 'number'   },
    { label: '·', latex: '*', offset: 0, type: 'operator' },
    { label: '1', latex: '1', offset: 0, type: 'number'   },
    { label: '2', latex: '2', offset: 0, type: 'number'   },
    { label: '3', latex: '3', offset: 0, type: 'number'   },
    { label: '−', latex: '-', offset: 0, type: 'operator' },
    { label: '0', latex: '0', offset: 0, type: 'number'   },
    { label: '.', latex: '.', offset: 0, type: 'number'   },
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

  // ── Cursore ───────────────────────────────────────────────────────────────
  private tokenBoundaries(): number[] {
    const bounds = [0];
    let pos = 0;
    for (const tok of this.tokens) {
      pos += tok.display.length;
      bounds.push(pos);
    }
    return bounds;
  }

  moveCursor(direction: 'left' | 'right') {
    const input = this.mathInput?.nativeElement as HTMLInputElement | null;
    if (!input) return;
    const cursor = input.selectionStart ?? 0;
    const bounds = this.tokenBoundaries();

    if (direction === 'left') {
      const target = [...bounds].reverse().find(b => b < cursor);
      if (target !== undefined) this.setCursor(target);
    } else {
      const target = bounds.find(b => b > cursor);
      if (target !== undefined) this.setCursor(target);
    }
  }

  private tokenIdxAt(charPos: number): number {
    let pos = 0;
    for (let i = 0; i < this.tokens.length; i++) {
      pos += this.tokens[i].display.length;
      if (pos >= charPos) return i + 1;
    }
    return this.tokens.length;
  }

  private charPosOf(tokenIdx: number): number {
    return this.tokens
      .slice(0, tokenIdx)
      .reduce((s, t) => s + t.display.length, 0);
  }

  private setCursor(pos: number) {
    const input = this.mathInput?.nativeElement as HTMLInputElement | null;
    if (!input) return;
    setTimeout(() => { input.focus(); input.setSelectionRange(pos, pos); });
  }

  // ── Inserimento ───────────────────────────────────────────────────────────

  private insertAt(idx: number, symbol: string, latex: string, offset: number) {
    const basePos = this.charPosOf(idx);

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

  private shouldAutoMultiply(prevToken: Token, newSymbol: string): boolean {
    const lastChar = prevToken.display[prevToken.display.length - 1];
    const prevEndsValue =
      /[0-9.]/.test(lastChar)             ||
      'xyπe'.includes(lastChar)           ||
      lastChar === ')' || lastChar === '⁾' ||
      '²⁰¹³⁴⁵⁶⁷⁸⁹ˣʸ'.includes(lastChar) ||
      '₀₁₂₃₄₅₆₇₈₉ₓᵧ'.includes(lastChar);

    if (!prevEndsValue) return false;
    if (/[0-9.]/.test(lastChar) && /^[0-9.]/.test(newSymbol)) return false;

    return (
      /^[0-9.xyπe√(]/.test(newSymbol) ||
      /^(sin|cos|tan|cot|sec|csc|arc|ln|log|exp)/.test(newSymbol)
    );
  }

  // ── Gestione eventi ───────────────────────────────────────────────────────

  handleKey(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft')  { event.preventDefault(); this.moveCursor('left');  return; }
    if (event.key === 'ArrowRight') { event.preventDefault(); this.moveCursor('right'); return; }
    if (['Home', 'End'].includes(event.key)) return;
    if (event.key === 'Backspace')  { this.cancelText(); }
    event.preventDefault();
  }

  addSymbol(symbol: string, latex: string, offset: number) {
    const input  = this.mathInput.nativeElement;
    const cursor = (input.selectionStart as number) ?? this.textValue.length;
    let insIdx   = this.tokenIdxAt(cursor);
    let cursorShift = 0;

    if (!this.isSubscriptMode && !this.isAltscriptMode) {
      if (insIdx > 0 && this.shouldAutoMultiply(this.tokens[insIdx - 1], symbol)) {
        const mulTok: Token = { display: '·', latex: '*' };
        this.tokens.splice(insIdx, 0, mulTok);
        insIdx++;
        cursorShift = mulTok.display.length;
      }
    }

    if (symbol === 'logₐ(') {
      const tok: Token = { display: 'log', latex: 'log(' };
      this.tokens.splice(insIdx, 0, tok);
      this.isSubscriptMode = true;
      this.setCursor(cursor + cursorShift + tok.display.length);
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
      this.setCursor(cursor + cursorShift + 1);
      return;
    }

    if (this.isSubscriptMode) {
      if (symbol === '(') {
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
  }

  sendToBackend(flag: boolean = false) {
    if (!this.canSend) return;

    let realLatex: string;
    try {
      realLatex = this.mathParser.getLatex(this.latex);
      if (!realLatex) throw new Error('empty');
    } catch {
      this.toast.show('Espressione non valida: controlla la sintassi.');
      return;
    }

    this.latexSender.setData(realLatex);

    const postHistory$ = this.latexSender.postHistory(this.textValue, this.latex);

    if (!postHistory$) {
      if (!flag) this.sentToBackend.emit(true);
      return;
    }

    postHistory$.subscribe({
      next: (res) => {
        console.log('POST OK', res);
        if (!flag) this.sentToBackend.emit(true);
      },
      error: (err) => {
        console.error('POST ERROR', err);
        this.toast.show('Errore durante il salvataggio nella cronologia.');
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    this.latexSender.sendImageToBackend(this.selectedFile).subscribe({
      next: (response: any) => {
        const latexStr = response['latex'] ?? '';
        this.tokens = [{ display: latexStr, latex: latexStr }];
        this.triggerConfirm();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore:', err.status, err.error);
        this.cdr.markForCheck();
      },
    });
  }

  private confirmTimer: ReturnType<typeof setTimeout> | null = null;

  private triggerConfirm() {
    if (this.confirmTimer) clearTimeout(this.confirmTimer);
    this.showConfirm = true;
    this.cdr.markForCheck();
    this.confirmTimer = setTimeout(() => {
      this.showConfirm = false;
      this.cdr.markForCheck();
    }, 1800);
  }

  toggleAdvanced() { this.isAdvanced = !this.isAdvanced; }
}