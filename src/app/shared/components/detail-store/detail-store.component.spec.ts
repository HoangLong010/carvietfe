import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailStoreComponent } from './detail-store.component';

describe('DetailStoreComponent', () => {
  let component: DetailStoreComponent;
  let fixture: ComponentFixture<DetailStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailStoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
