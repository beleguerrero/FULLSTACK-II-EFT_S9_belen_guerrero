import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterModule } from '@angular/router';

import { Recuperar } from './recuperar';

describe('Recuperar', () => {
  let component: Recuperar;
  let fixture: ComponentFixture<Recuperar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Recuperar,
        RouterModule.forRoot([])
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Recuperar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
