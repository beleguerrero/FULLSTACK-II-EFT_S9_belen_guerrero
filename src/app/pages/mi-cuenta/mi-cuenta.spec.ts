import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterModule } from '@angular/router';
import { MiCuenta } from './mi-cuenta';

describe('MiCuenta', () => {
  let component: MiCuenta;
  let fixture: ComponentFixture<MiCuenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MiCuenta,
        RouterModule.forRoot([])
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MiCuenta);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
