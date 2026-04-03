import { TestBed } from '@angular/core/testing';

import { LatexSenderService } from './latex-sender-service';

describe('LatexSenderService', () => {
  let service: LatexSenderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LatexSenderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
