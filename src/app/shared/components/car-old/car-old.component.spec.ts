import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarOldComponent } from './car-old.component';

describe('CarOldComponent', () => {
  let component: CarOldComponent;
  let fixture: ComponentFixture<CarOldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarOldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarOldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
