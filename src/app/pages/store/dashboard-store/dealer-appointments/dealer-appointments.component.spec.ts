import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealerAppointmentsComponent } from './dealer-appointments.component';

describe('DealerAppointmentsComponent', () => {
  let component: DealerAppointmentsComponent;
  let fixture: ComponentFixture<DealerAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DealerAppointmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealerAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
