import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  errorMessage = '';
  isLoading = false;

  captchaImage: string = '';
  captchaKey: string = '';

  private baseUrl = 'http://localhost:5239';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      captcha: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCaptcha();
  }

  // ---------------- CAPTCHA ----------------
  loadCaptcha(): void {
    this.http.get<any>(`${this.baseUrl}/api/v1/Account/GenerateCaptcha/captcha`)
      .subscribe({
        next: (res) => {
          this.captchaImage = res.image;
          this.captchaKey = res.key;
        },
        error: (err) => {
          console.error('Captcha error:', err);
        }
      });
  }

  refreshCaptcha(): void {
    this.loadCaptcha();
    this.loginForm.patchValue({ captcha: '' });
  }

  // ---------------- LOGIN ----------------
  onSubmit(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const body = {
      userName: this.loginForm.value.userName,
      password: this.loginForm.value.password,
      request: {
        captcha: this.loginForm.value.captcha,
        key: this.captchaKey
      }
    };

    this.http.post<any>(
      `${this.baseUrl}/api/v1/Account/Login/Login`,
      body,
      { headers }
    ).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.items.value?.jwt) {
          localStorage.setItem('token', res.items.value.jwt);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);

        this.errorMessage =
          err?.error?.detail ||
          'Login failed';
      }
    });
  }
}
// import { Component, ViewEncapsulation } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { Router, RouterLink } from '@angular/router';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, RouterLink],
//   templateUrl: './login.component.html',
//   encapsulation: ViewEncapsulation.None
// })
// export class LoginComponent {
//   loginForm: FormGroup;
//   errorMessage: string = '';
//   isLoading: boolean = false;
//   apiUrl = 'http://localhost:5239/api/v1/Account/Login/Login';
//   constructor(
//     private fb: FormBuilder,
//     private http: HttpClient,
//     private router: Router
//   ) {
//     this.loginForm = this.fb.group({
//       userName: ['', [Validators.required]],
//       password: ['', [Validators.required]]
//     });
//   }

//   onSubmit(): void {
//     if (this.loginForm.invalid) {
//       this.loginForm.markAllAsTouched();
//       return;
//     }

//     this.isLoading = true;
//     this.errorMessage = '';

//     this.http.post(this.apiUrl, this.loginForm.value)
//       .subscribe({
//         next: (response: any) => {
//           this.isLoading = false;
//           if (response && response.items?.value?.jwt) {
//             localStorage.setItem('token', response.items.value.jwt);
//             this.router.navigate(['/dashboard']);
//           }
//         },
//         error: (error) => {
//           this.isLoading = false;
//           if (error.error && error.error.detail) {
//             this.errorMessage = error.error.detail;
//           } else {
//             this.errorMessage = 'خطایی در برقراری ارتباط با سرور رخ داده است';
//           }
//         }
//       });
//   }
// }
