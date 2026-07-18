import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterModule } from '@angular/router';

import { Carrito } from './carrito';

describe('Carrito', () => {
  let component: Carrito;
  let fixture: ComponentFixture<Carrito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Carrito,
        RouterModule.forRoot([])
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Carrito);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
