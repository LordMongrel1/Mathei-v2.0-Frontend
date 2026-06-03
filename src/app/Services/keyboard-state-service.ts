import { Injectable } from '@angular/core';

export interface Token {
  display: string;
  latex: string;
}

@Injectable({
  providedIn: 'root',
})
export class KeyboardStateService {
  pendingSend = false;
  tokens: Token[] = [];
  isAdvanced: boolean = false;
  isSubscriptMode: boolean = false;
  isAltscriptMode: boolean = false;
  altscriptCloseToken: Token | null = null;
  altscriptCloseTokenStack: Token[] = [];
  plotFunction: string = 'sqrt(pow(x, 3) - pow(x, 2)) / log(x - 1)';
}
