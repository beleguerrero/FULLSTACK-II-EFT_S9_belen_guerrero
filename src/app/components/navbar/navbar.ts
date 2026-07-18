import { Component, OnInit } from '@angular/core';

import { Router,RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Auth } from '../../services/auth';
import { CarritoService } from '../../services/carrito-service';
import { CategoriaData } from '../../services/modelos';
import { ProductoService } from '../../services/producto-service';
import { PedidoService } from '../../services/pedido-service';

import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  usuario: string | null = null;
  usuario_id: string | null = null;
  
  categorias: CategoriaData[] = [];
  cargando: boolean = true;

  constructor(
    public authService: Auth,
    private router: Router,
    public carritoService: CarritoService,
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef,
  )  {
    this.authService.usuarioActual$.subscribe(u => {
      this.usuario = u ? u.username : null;
      this.usuario_id = u ? u.id : null;
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.carritoService.guardarCarritoActual(this.usuario_id);

  }

  cerrarSesion(): void {
    this.authService.logout();
    this.carritoService.guardarCarritoActual(null);
    this.router.navigate(['/']);
  }

  cargarCategorias(): void {
    this.productoService.apiObtenerCategorias().subscribe({
      next: (datos) => {
        this.categorias = datos.slice(0, 4);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

}
