
import { Component, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { tap } from 'rxjs/operators';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);

  // State
  authMode = signal<'login' | 'register'>('login');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  // Forms
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false)
  });

  registerForm = new FormGroup({
    orgName: new FormControl('', [Validators.required, Validators.minLength(3)]), // Critical for Tenant creation
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  ngOnInit() {
    const rememberedEmail = localStorage.getItem('apartEl_remembered_email');
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
    }
  }

  setMode(mode: 'login' | 'register') {
    this.authMode.set(mode);
    this.loginForm.reset();
    this.registerForm.reset();
    this.errorMessage.set('');
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  onLogin() {
    this.errorMessage.set('');
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password, rememberMe } = this.loginForm.value;
    const cleanEmail = email?.trim();
    this.isLoading.set(true);
    this.apiService.login(cleanEmail!, password!).pipe(tap(() => this.isLoading.set(false))).subscribe({
      next: (result) => {
        if (result.success) {
          if (rememberMe && email) localStorage.setItem('apartEl_remembered_email', email);
          else localStorage.removeItem('apartEl_remembered_email');
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set(result.error || 'Login failed.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Login failed.');
      },
    });
  }

  onRegister() {
    this.errorMessage.set('');
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { orgName, email, password } = this.registerForm.value;
    this.isLoading.set(true);
    this.apiService.register(orgName!, email!, password!).pipe(tap(() => this.isLoading.set(false))).subscribe({
      next: (result) => {
        if (result.success) this.router.navigate(['/dashboard']);
        else this.errorMessage.set(result.error ?? 'Registration failed.');
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Registration failed.');
      },
    });
  }

  loginWithGoogle() {
    this.isLoading.set(true);
    this.apiService.register('Demo Organization', 'user@gmail.com', 'demo-password-123').pipe(tap(() => this.isLoading.set(false))).subscribe({
      next: (r) => { if (r.success) this.router.navigate(['/dashboard']); },
      error: () => this.isLoading.set(false),
    });
  }

  loginWithTelegram() {
    this.isLoading.set(true);
    this.apiService.register('Telegram Workspace', 'tg_user@telegram.org', 'tg-password-123').pipe(tap(() => this.isLoading.set(false))).subscribe({
      next: (r) => { if (r.success) this.router.navigate(['/dashboard']); },
      error: () => this.isLoading.set(false),
    });
  }

  // Getters
  get loginEmailError() { return this.loginForm.get('email')?.invalid && this.loginForm.get('email')?.touched; }
  get loginPassError() { return this.loginForm.get('password')?.invalid && this.loginForm.get('password')?.touched; }

  get regOrgError() { return this.registerForm.get('orgName')?.invalid && this.registerForm.get('orgName')?.touched; }
  get regEmailError() { return this.registerForm.get('email')?.invalid && this.registerForm.get('email')?.touched; }
  get regPassError() { return this.registerForm.get('password')?.invalid && this.registerForm.get('password')?.touched; }
}
