import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSubcategory } from './delete-subcategory';

describe('DeleteSubcategory', () => {
  let component: DeleteSubcategory;
  let fixture: ComponentFixture<DeleteSubcategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteSubcategory],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteSubcategory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
