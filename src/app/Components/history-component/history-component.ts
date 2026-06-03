import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth';
import { LatexSenderService } from '../../Services/latex-sender-service';
import { KeyboardStateService } from '../../Services/keyboard-state-service';
import { ConfirmDialogService } from '../../Services/confirm-dialog-service';
import { ConfirmDialogComponent } from '../confirm-dialog-component/confirm-dialog-component';

interface FunctionEntry { id: number; function: string; latex: string; }

@Component({
  selector: 'app-history-component',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './history-component.html',
  styleUrl: './history-component.css',
})
export class HistoryComponent implements OnInit {
  functions:   FunctionEntry[] = [];
  loading      = true;
  error        = false;
  offset       = 0;
  readonly pageSize = 10;
  hasMore      = true;
  deletingAll  = false;
  deletingIds  = new Set<number>();

  constructor(
    private auth:          AuthService,
    private router:        Router,
    private cdr:           ChangeDetectorRef,
    private latexSender:   LatexSenderService,
    private keyboardState: KeyboardStateService,
    private dialog:        ConfirmDialogService,
  ) {}

  ngOnInit() { this.loadHistory(); }

  loadHistory() {
    this.loading = true;
    this.error   = false;
    (this.latexSender.getHistory(this.offset, this.pageSize) as any).subscribe({
      next: (res: { functions: FunctionEntry[] }) => {
        this.functions = [...this.functions, ...res.functions];
        this.hasMore   = res.functions.length === this.pageSize;
        this.offset   += res.functions.length;
        this.loading   = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = true; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  loadMore() { if (!this.loading && this.hasMore) this.loadHistory(); }

  async deleteFunction(event: Event, id: number): Promise<void> {
    event.stopPropagation();
    const ok = await this.dialog.confirm({
      title:        'Elimina funzione',
      message:      'Vuoi rimuovere questa funzione dalla cronologia? L\'operazione non può essere annullata.',
      confirmLabel: 'Elimina',
      icon:         'trash',
      danger:       true,
    });
    if (!ok) return;

    this.deletingIds.add(id);
    this.cdr.detectChanges();

    (this.latexSender.deleteFunction(id) as any).subscribe({
      next: () => {
        setTimeout(() => {
          this.functions = this.functions.filter(f => f.id !== id);
          this.deletingIds.delete(id);
          this.offset = Math.max(0, this.offset - 1);
          this.cdr.detectChanges();
        }, 280);
      },
      error: (err: any) => {
        this.deletingIds.delete(id);
        console.error('Errore eliminazione:', err);
        this.cdr.detectChanges();
      },
    });
  }

  async deleteAll(): Promise<void> {
    if (this.functions.length === 0 || this.deletingAll) return;
    const ok = await this.dialog.confirm({
      title:        'Elimina tutta la cronologia',
      message:      'Questa operazione è irreversibile. Tutte le funzioni salvate verranno eliminate definitivamente.',
      confirmLabel: 'Elimina tutto',
      icon:         'warning',
      danger:       true,
    });
    if (!ok) return;

    this.deletingAll = true;
    this.cdr.detectChanges();

    (this.latexSender.deleteAllFunctions() as any).subscribe({
      next: () => {
        this.functions = []; this.offset = 0; this.hasMore = false; this.deletingAll = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.deletingAll = false;
        console.error('Errore eliminazione totale:', err);
        this.cdr.detectChanges();
      },
    });
  }

  async logout(): Promise<void> {
    const ok = await this.dialog.confirm({
      title:        'Esci dall\'account',
      message:      'Sei sicuro di voler uscire? Potrai sempre rientrare con le tue credenziali.',
      confirmLabel: 'Esci',
      icon:         'logout',
      danger:       false,
    });
    if (ok) this.auth.logout();
  }

  goToPlotter(fn?: FunctionEntry) {
    if (fn) {
      this.keyboardState.tokens      = [{ display: fn.function, latex: fn.latex }];
      this.keyboardState.pendingSend = true;
    }
    this.router.navigate(['/homepage']);
  }

  goBack()  { this.router.navigate(['/homepage']); }
  trackById(_: number, item: FunctionEntry) { return item.id; }
}