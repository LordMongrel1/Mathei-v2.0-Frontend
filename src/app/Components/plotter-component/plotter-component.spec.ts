import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotterComponent } from './plotter-component';

describe('PlotterComponent', () => {
  let component: PlotterComponent;
  let fixture: ComponentFixture<PlotterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlotterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlotterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
