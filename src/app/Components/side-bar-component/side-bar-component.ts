import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { LatexSenderService } from '../../Services/latex-sender-service';
import { of } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { ToastService } from '../../Services/toast-service';

@Component({
  selector: 'app-side-bar-component',
  standalone: true,
  imports: [MatSidenavModule, MatExpansionModule, MatDividerModule],
  templateUrl: './side-bar-component.html',
  styleUrl: './side-bar-component.css',
})
export class SideBarComponent {
  panelData: Record<string, string> = {};

  constructor(
    private latexSenderService: LatexSenderService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
  ) {}

  private handleWarning(data: any): void {
    if (data?.warning) {
      const msg = typeof data.warning === 'string'
        ? data.warning
        : 'Attenzione: il risultato potrebbe essere impreciso.';
      this.toast.show(msg, 'Avviso');
    }
  }

  onPanelOpened(section: string): void {
    if (this.panelData[section]) return;
    this.latexSenderService.sendToBackend(section).subscribe({
      next: (data: any) => {
        this.handleWarning(data);
        if (section === 'asymptotes') {
          this.panelData[section] = this.formatAsymptotes(data.msg);
        } else if (section === 'sign') {
          this.panelData[section] = this.formatSign(data.msg);
        } else {
          this.panelData[section] = data.msg;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(`Errore per ${section}:`, err);
        this.toast.show(err.error.detail || 'Si è verificato un errore sconosciuto.', 'Errore');
      }
    });
  }

  onDerivativeSignOpened(order: 1 | 2): void {
    const signKey = order === 1 ? 'sign_d1' : 'sign_d2';
    if (this.panelData[signKey]) return;

    const fetchD1$ = this.panelData['d1']
      ? of(this.panelData['d1'])
      : this.latexSenderService.sendToBackend('derivatives').pipe(
          tap((data: any) => { this.panelData['d1'] = data.msg; this.cdr.detectChanges(); }),
          map((data: any) => data.msg as string)
        );

    if (order === 1) {
      fetchD1$.pipe(
        switchMap((d1: string) => this.latexSenderService.sendToBackend('sign', d1))
      ).subscribe({
        next: (data: any) => {
          this.handleWarning(data);          // ← NEW
          this.panelData[signKey] = this.formatSign(data.msg);
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Errore segno f':", err),
      });
    } else {
      fetchD1$.pipe(
        switchMap((d1: string) => {
          const fetchD2$ = this.panelData['d2']
            ? of(this.panelData['d2'])
            : this.latexSenderService.sendToBackend('derivatives', d1).pipe(
                tap((data: any) => { this.panelData['d2'] = data.msg; this.cdr.detectChanges(); }),
                map((data: any) => data.msg as string)
              );
          return fetchD2$;
        }),
        switchMap((d2: string) => this.latexSenderService.sendToBackend('sign', d2))
      ).subscribe({
        next: (data: any) => {
          this.handleWarning(data);          // ← NEW
          this.panelData[signKey] = this.formatSign(data.msg);
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Errore segno f'':", err),
      });
    }
  }

  onSecondDerivativeOpened(): void {
    if (this.panelData['d2']) return;

    const fetchD1$ = this.panelData['d1']
      ? of(this.panelData['d1'])
      : this.latexSenderService.sendToBackend('derivatives').pipe(
          tap((data: any) => {
            this.panelData['d1'] = data.msg;
            this.cdr.detectChanges();
          }),
          map((data: any) => data.msg as string)
        );

    fetchD1$.pipe(
      switchMap((d1: string) =>
        this.latexSenderService.sendToBackend('derivatives', d1)
      )
    ).subscribe({
      next: (data: any) => {
        this.panelData['d2'] = data.msg;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Errore derivata f'':", err),
    });
  }

  // ── Formatters (unchanged) ───────────────────────────────────────────────
  private formatSign(raw: Array<[string, string, string]> | string): string {
    const fmt = (v: string): string => {
      if (v === '-oo' || v === '-inf') return '-∞';
      if (v === 'oo'  || v === 'inf')  return '+∞';
      if (v === 'pi')  return 'π';
      if (v === '-pi') return '-π';
      if (v === 'E' || v === 'e') return 'e';
      return v.replace(/\*?pi/g, 'π').replace(/\*?e\b/g, 'e');
    };

    let intervals: [string, string, string][];
    if (Array.isArray(raw)) {
      intervals = raw as [string, string, string][];
    } else {
      const parts = (raw as string).split(',').map(s => s.trim());
      if (parts.length < 3 || parts.length % 3 !== 0) {
        return `<span class="sign-raw">${raw}</span>`;
      }
      intervals = [];
      for (let i = 0; i < parts.length; i += 3) {
        intervals.push([parts[i], parts[i + 1], parts[i + 2]]);
      }
    }

    const rows = intervals.map(([start, end, signRaw]) => {
      const s    = fmt(start);
      const e    = fmt(end);
      const sign = signRaw === '+' ? '+' : signRaw === '-' ? '−' : signRaw;
      const cls  = signRaw === '+' ? 'pos' : signRaw === '-' ? 'neg' : 'zero';
      return `
        <tr>
          <td class="si">(${s},&nbsp; ${e})</td>
          <td class="sv ${cls}">${sign}</td>
        </tr>`;
    });

    return `
      <table class="sign-table">
        <thead><tr><th>Intervallo</th><th>Segno</th></tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>`;
  }

  private formatAsymptotes(data: any): string {
    const parsed: Record<string, any> =
      typeof data === 'string'
        ? JSON.parse(data.replace(/'/g, '"'))
        : data;

    const lines: string[] = [];
    for (const [key, values] of Object.entries(parsed)) {
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      if (!Array.isArray(values) || values.length === 0) {
        lines.push(`${label}: nessuno`);
        continue;
      }
      if (key === 'asintoti orizzontali') values.forEach(v => lines.push(`${label}: y = ${v}`));
      else if (key === 'asintoti verticali') values.forEach(v => lines.push(`${label}: x = ${v}`));
      else if (key === 'asintoti obliqui') {
        values.forEach(([m, q]) => {
          const sign = q >= 0 ? '+' : '-';
          lines.push(`${label}: y = ${m}x ${sign} ${Math.abs(q)}`);
        });
      }
    }
    return lines.join('<br>');
  }
}