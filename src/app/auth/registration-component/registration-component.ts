import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm  = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-registration-component',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './registration-component.html',
  styleUrl: './registration-component.css'
})
export class RegisterComponent {
  form: FormGroup;
  error   = '';
  success = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group(
      {
        email:           ['', [Validators.required, Validators.email]],
        password:        ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        terms:           [false, Validators.requiredTrue]
      },
      { validators: passwordMatchValidator }
    );
  }

  // Calcola forza password per la strength bar
  get passwordStrength(): { percent: number; level: string; label: string } {
    const pw = this.form.get('password')?.value ?? '';
    let score = 0;
    if (pw.length >= 6)  score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { percent: 33,  level: 'weak',   label: 'Debole' };
    if (score <= 3) return { percent: 66,  level: 'medium', label: 'Media' };
    return             { percent: 100, level: 'strong', label: 'Forte' };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error   = '';

    const { email, password } = this.form.value;

    this.auth.register({ email, password }).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.error   = err.error?.detail || 'Errore durante la registrazione';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}