import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSubcategory } from './edit-subcategory';

describe('EditSubcategory', () => {
  let component: EditSubcategory;
  let fixture: ComponentFixture<EditSubcategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSubcategory],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSubcategory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
