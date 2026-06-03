import { ChangeDetectionStrategy, ChangeDetectorRef,
         Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastState } from '../../Services/toast-service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-component.html',
  styleUrl:    './toast-component.css',
})
export class ToastComponent implements OnInit, OnDestroy {
  toast: ToastState = { visible: false, message: '', progress: 100, title: 'Errore' };
  private sub!: Subscription;

  constructor(
    public  toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.sub = this.toastService.state$.subscribe(s => {
      this.toast = s;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }
}