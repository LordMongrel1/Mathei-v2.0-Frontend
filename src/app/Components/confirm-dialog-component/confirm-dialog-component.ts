import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../Services/confirm-dialog-service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog-component.html',
  styleUrl:    './confirm-dialog-component.css',
})
export class ConfirmDialogComponent implements OnDestroy {
  constructor(public dialogService: ConfirmDialogService) {}

  ngOnDestroy() { document.body.style.overflow = ''; }

  iconClass(s: { icon: string; danger: boolean }): string {
    return s.icon === 'logout' ? 'rose' : 'red';
  }

  confirmClass(s: { icon: string; danger: boolean }): string {
    return s.icon === 'logout' ? 'rose' : 'red';
  }
}