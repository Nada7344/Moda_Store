import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollRevealDirective } from './scroll-reveal.directive';

describe('ScrollRevealDirective', () => {
  let component: ScrollRevealDirective;
  let fixture: ComponentFixture<ScrollRevealDirective>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollRevealDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollRevealDirective);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
