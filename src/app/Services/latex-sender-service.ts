import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LatexSenderService {
  private data = signal('');

  setData(update: string) {
    this.data.set(update);
  }

  getData() {
    return this.data();
  }
}
