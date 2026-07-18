import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterModule } from '@angular/router';
import { MisCompras } from './mis-compras';

describe('MisCompras', () => {
  let component: MisCompras;
  let fixture: ComponentFixture<MisCompras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MisCompras,
        RouterModule.forRoot([])
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MisCompras);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
