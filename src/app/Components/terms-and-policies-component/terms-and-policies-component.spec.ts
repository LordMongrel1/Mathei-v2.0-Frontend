import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsAndPoliciesComponent } from './terms-and-policies-component';

describe('TermsAndPoliciesComponent', () => {
  let component: TermsAndPoliciesComponent;
  let fixture: ComponentFixture<TermsAndPoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsAndPoliciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsAndPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
