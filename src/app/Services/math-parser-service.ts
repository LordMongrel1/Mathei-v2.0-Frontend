import { Injectable } from '@angular/core';
//import { create, all } from 'mathjs';
import { evaluate, parse } from 'mathjs';

@Injectable({ providedIn: 'root' })
export class MathParserService {

  //private math = create({all});

  evaluate(expression: string, scope?: object): number {
    try {
      return evaluate(expression, scope);
    } catch {
      return NaN;
    }
  }

  parseBalancedArg(str: string, start: number): [string, number] {
    let depth = 0;
    let i = start;
    while (i < str.length) {
      const c = str[i];
      if (c === '(') depth++;
      else if (c === ')') {
        if (depth === 0) return [str.slice(start, i), i];
        depth--;
      } else if (c === ',' && depth === 0) {
        return [str.slice(start, i), i];
      }
      i++;
    }
    return [str.slice(start), i];
  }

  swapLogArgs(latex: string): string {
    const out: string[] = [];
    let i = 0;
    while (i < latex.length) {
      if (latex.startsWith('log(', i)) {
        i += 4;
        const [firstArg, afterFirst] = this.parseBalancedArg(latex, i);
        if (afterFirst < latex.length && latex[afterFirst] === ',') {
          const [secondArg, afterSecond] = this.parseBalancedArg(latex, afterFirst + 1);
          out.push(
            'log(' +
            this.swapLogArgs(secondArg) + ',' +
            this.swapLogArgs(firstArg)  +
            ')'
          );
          i = afterSecond + 1;
        } else {
          out.push('log(' + this.swapLogArgs(firstArg) + ')');
          i = afterFirst + 1;
        }
      } else {
        out.push(latex[i]);
        i++;
      }
    }
    return out.join('');
  }

  getLatex(latex: string): string {
    try {
      let corrected = this.swapLogArgs(latex);
      corrected = corrected
        .replace('atan', 'arctan')
        .replace('acos', 'arccos')
        .replace('asin', 'arcsin');
      const node = parse(corrected);
      let text = node.toTex();
      text = text
        .replace(/\\mathrm{arcsin}/g, '\\arcsin')
        .replace(/\\mathrm{arccos}/g, '\\arccos')
        .replace(/\\mathrm{arctan}/g, '\\arctan');
      return text;
    } catch (error) {
      console.error('Errore nella conversione LaTeX:', error);
      return '';
    }
  }
}