import { Component } from '@angular/core';

import { ProductItem } from '../../components/product-item/product-item';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    ProductItem,
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {}
