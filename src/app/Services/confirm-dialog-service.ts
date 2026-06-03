import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DialogOptions {
  title:         string;
  message:       string;
  confirmLabel?: string;
  icon?:         'trash' | 'warning' | 'logout';
  danger?:       boolean;
}

export interface DialogState extends Required<DialogOptions> {
  visible: boolean;
}

const CLOSED: DialogState = {
  visible: false, title: '', message: '',
  confirmLabel: 'Conferma', icon: 'warning', danger: true,
};

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private resolve: ((v: boolean) => void) | null = null;
  state$ = new BehaviorSubject<DialogState>(CLOSED);

  confirm(options: DialogOptions): Promise<boolean> {
    this.state$.next({
      visible:      true,
      confirmLabel: options.confirmLabel ?? 'Conferma',
      icon:         options.icon         ?? 'warning',
      danger:       options.danger       ?? true,
      ...options,
    });
    document.body.style.overflow = 'hidden';
    return new Promise(res => (this.resolve = res));
  }

  respond(value: boolean): void {
    this.state$.next(CLOSED);
    document.body.style.overflow = '';
    this.resolve?.(value);
    this.resolve = null;
  }
}