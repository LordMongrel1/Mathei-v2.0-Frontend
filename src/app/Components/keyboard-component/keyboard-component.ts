import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MathSymbol {
  label: string;
  latex: string;
  type: 'number' | 'operator' | 'variable' | 'function';
  offset?: number;
}

@Component({
  selector: 'app-keyboard-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './keyboard-component.html',
  styleUrl: './keyboard-component.css',
})
export class KeyboardComponent {
  textValue: string = '';
  latex: string = '';

  isAdvanced: boolean = false;

  toggleAdvanced() {
    this.isAdvanced = !this.isAdvanced;
  }

  leftBase: MathSymbol[] = [
    { label: 'x', latex: 'x', type: 'variable' }, 
    { label: 'y', latex: 'y', type: 'variable' },
    { label: '²', latex: '^2', type: 'function' }, 
    { label: 'ⁿ', latex: '^()', type: 'function', offset: 1 },
    { label: '(', latex: '(', type: 'operator' }, 
    { label: ')', latex: ')', type: 'operator' },
    { label: '√', latex: 'sqrt()', type: 'function', offset: 1 }, 
    { label: 'π', latex: 'pi', type: 'variable' }
  ];

  functions: MathSymbol[] = [
    { label: 'e', latex: 'e', type: 'variable' },
    { label: 'exp()', latex: 'exp()', type: 'function', offset: 1 },
    { label: 'ln', latex: 'log()', type: 'function', offset: 1 }, 
    { label: 'logₐ(', latex: 'log(', type: 'function', offset: 0 },
    { label: 'sin()', latex: 'sin()', type: 'function', offset: 1 }, 
    { label: 'cos()', latex: 'cos()', type: 'function', offset: 1 },
    { label: 'tan()', latex: 'tan()', type: 'function', offset: 1 }, 
    { label: 'cot()', latex: 'cot()', type: 'function', offset: 1},
    { label: 'sec()', latex: 'sec()', type: 'function', offset: 1 },
    { label: 'csc()', latex: 'csc()', type: 'function', offset: 1 },
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

  @Output() symbolClick = new EventEmitter<string>();
  @ViewChild('mathInput') mathInput!: ElementRef;

  subscriptMap: { [key: string]: string } = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
    '10': '₁₀',
    'x': 'ₓ',
    '/': '⁄',
    '(': '₍',
    ')': '₎'
  };

  altscriptMap: { [key: string]: string } = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '10': '¹⁰',
    'x': 'ˣ',
    '/': '⁄',
    '(': '⁽',
    ')': '⁾'
  };

  isSubscriptMode = false;
  isAltscriptMode = false;

  addSymbol(symbol: string, latex: string, offset: number) {
    const input = this.mathInput.nativeElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    let charToInsert = symbol;

    if (symbol === 'logₐ(' || symbol === 'ⁿ') {
      if (symbol === 'logₐ(') {
        charToInsert = 'log'; 
        this.isSubscriptMode = true;
        this.latex += 'log(';
      } else {
        charToInsert = '⁽⁾';
        console.log('Offset for exponent:', offset);
        console.log('LaTeX before exponent:', latex);
        this.latex += latex;
        this.isAltscriptMode = true;
      }
    } else if (this.isSubscriptMode && this.subscriptMap[symbol]) {
      charToInsert = this.subscriptMap[symbol];
      this.latex += symbol;
    } else if (this.isAltscriptMode && this.altscriptMap[symbol]) {
      charToInsert = this.altscriptMap[symbol];
      this.latex = this.latex.substring(0, this.latex.length - 1) + latex + this.latex.substring(this.latex.length - 1);
    } else {

      if (this.isSubscriptMode) {
        this.latex += ', )';
        this.isSubscriptMode = false;
      } else if (this.isAltscriptMode) {
        this.latex += ')';
        this.isAltscriptMode = false;
      }

      this.latex += latex;
    }

    this.textValue = this.textValue.substring(0, start) + charToInsert + this.textValue.substring(end);

    setTimeout(() => {
      input.focus();
      const newCursorPos = start + charToInsert.length - offset;
      input.setSelectionRange(newCursorPos, newCursorPos);
    });

    console.log('LaTeX:', this.latex);
  }

  cancelText() {
    let input = this.mathInput.nativeElement;
    let start = input.selectionStart;
    let end = input.selectionEnd;
    let deletedText = this.textValue.substring(start - 1, end);

    this.textValue = this.textValue.substring(0, start - 1) + this.textValue.substring(end);
    setTimeout(() => {
      input.focus();
      const newCursorPos = start - 1;
      input.setSelectionRange(newCursorPos, newCursorPos);
    });

    this.latex = this.latex.substring(0, this.latex.length - deletedText.length);
    console.log('LaTeX after deletion:', this.latex);
  }
}
