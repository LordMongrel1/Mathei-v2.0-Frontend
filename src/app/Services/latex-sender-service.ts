import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LatexSenderService {
  private function: string = '';

  constructor(private http: HttpClient) {}

  setData(newFunction: string) {
    this.function = newFunction;
  }

  /*sendToBackend() {
    console.log('Invio al backend:', this.function);
    return this.http.post('http://localhost:8000/', {
      function: this.function
    });
  }*/
}
