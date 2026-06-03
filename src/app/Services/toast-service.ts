import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastState {
  visible:  boolean;
  message:  string;
  progress: number;
  title:    string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly DURATION = 5000;
  private interval: ReturnType<typeof setInterval> | null = null;

  private _state$ = new BehaviorSubject<ToastState>({
    visible: false, message: '', progress: 100, title: 'Errore',
  });
  readonly state$ = this._state$.asObservable();

  show(message: string, title = 'Errore'): void {
    this.clear();
    this._state$.next({ visible: true, message, progress: 100, title });

    const step = 100 / (this.DURATION / 50);
    this.interval = setInterval(() => {
      const cur = this._state$.value;
      const p   = Math.max(0, cur.progress - step);
      if (p <= 0) { this.dismiss(); return; }
      this._state$.next({ ...cur, progress: p });
    }, 50);
  }

  dismiss(): void {
    this.clear();
    this._state$.next({ ...this._state$.value, visible: false, progress: 100 });
  }

  private clear(): void {
    if (this.interval !== null) { clearInterval(this.interval); this.interval = null; }
  }
}