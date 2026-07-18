import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';

import { Grilla } from './grilla';

describe('Grilla', () => {
  let component: Grilla;
  let fixture: ComponentFixture<Grilla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Grilla,
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

    fixture = TestBed.createComponent(Grilla);
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
