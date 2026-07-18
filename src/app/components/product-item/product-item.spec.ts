import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterModule } from '@angular/router';

import { ProductItem } from './product-item';

describe('ProductItem', () => {
  let component: ProductItem;
  let fixture: ComponentFixture<ProductItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductItem,
        RouterModule.forRoot([])
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductItem);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
