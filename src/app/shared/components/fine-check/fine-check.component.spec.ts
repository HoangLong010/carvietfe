import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineCheckComponent } from './fine-check.component';

describe('FineCheckComponent', () => {
  let component: FineCheckComponent;
  let fixture: ComponentFixture<FineCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FineCheckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FineCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
