import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';

import { Producto } from './producto';

describe('Producto', () => {
  let component: Producto;
  let fixture: ComponentFixture<Producto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Producto,
        RouterModule.forRoot([])
      ],
      providers: [
        provideRouter([
          {
            path: '404', component: DummyComponent
          }
        ])
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Producto);
    component = fixture.componentInstance;
  });

  @Component({
    template: ''
  })
  class DummyComponent {}

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
