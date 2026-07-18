import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosCompra } from './productos-compra';

describe('ProductosCompra', () => {
  let component: ProductosCompra;
  let fixture: ComponentFixture<ProductosCompra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosCompra],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosCompra);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
