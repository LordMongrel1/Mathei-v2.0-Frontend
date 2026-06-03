import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './../auth/auth';
import { MathParserService } from './math-parser-service';

@Injectable({ providedIn: 'root' })
export class LatexSenderService {
  private function: string = '';
  private apiUrl: string = 'http://localhost:8000/api';
  readonly pageSize = 10;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private mathParser: MathParserService
  ) {}

  setData(newFunction: string) {
    this.function = newFunction;
  }

  sendToBackend(section: string, customFunction?: string) {
    const f = customFunction ?? this.function;
    return this.http.get(
      `${this.apiUrl}/${section}?f=${encodeURIComponent(f)}`,
      { headers: this.auth.headers() }
    );
  }

  sendImageToBackend(image: File) {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post(`${this.apiUrl}/predict`, formData);
  }

  getHistory(offset: number, pageSize: number = this.pageSize) {
    return this.http.get(
      `${this.apiUrl}/history?elements=${pageSize}&offset=${offset}`,
      { headers: this.auth.headers() }
    );
  }

  postHistory(f: string, latex: string) {
    if (this.auth.isLoggedIn()) {
      return this.http.post(
        `${this.apiUrl}/history`,
        { f, latex },
        { headers: this.auth.headers() }
      );
    }
    console.log('User not logged in. Cannot post history.');
    return null;
  }

  deleteFunction(id: number) {
    return this.http.delete(
      `${this.apiUrl}/history/${id}`,
      { headers: this.auth.headers() }
    );
  }

  deleteAllFunctions() {
    return this.http.delete(
      `${this.apiUrl}/history`,
      { headers: this.auth.headers() }
    );
  }

  convertToLatex(mathExpression: string): string {
    return this.mathParser.getLatex(mathExpression);
  }
}