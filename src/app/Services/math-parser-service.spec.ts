import { TestBed } from '@angular/core/testing';

import { MathParserService } from './math-parser-service';

describe('MathParserService', () => {
  let service: MathParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MathParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
