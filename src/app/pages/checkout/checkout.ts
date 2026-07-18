import { Component } from '@angular/core';

import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

import { ResumenCompra } from '../../components/resumen-compra/resumen-compra';
import { ProductosCompra } from '../../components/productos-compra/productos-compra';
import { Auth } from '../../services/auth';
import { CarritoService } from '../../services/carrito-service';
import { ProductoService } from '../../services/producto-service';
import { PedidoService } from '../../services/pedido-service';
import { ProductoData, ProductoCarrito, ResumenCarrito, DetalleEnvio } from '../../services/modelos';

import { formatearPrecio, obtenerPrecioFinal } from '../../utils/product-utils';
import { getHtmlErrores, obtenerErroresFormulario, getFechaStr } from '../../utils/form-util';
import { edadMinimaValidator } from '../../validators/custom-validators';
import { toastSuccess, toastError } from '../../utils/swal-utils';
import { calcularResumen, obtenerProductoCarrito } from '../../utils/carrito-utils';



@Component({
  selector: 'app-checkout',
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    ProductosCompra,
    ResumenCompra,
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  productosCarrito: ProductoCarrito[] = [];
  resumenCarrito: ResumenCarrito = {
    total_productos: 0,
    total_productos_sin_dcto: 0,
    descuento: 0,
    descuento_vip: 0,
    total_envio: 0,
    total_final: 0,
  }
  es_vip:boolean = false;

  formatearPrecio = formatearPrecio;
  obtenerPrecioFinal = obtenerPrecioFinal;

  productos: ProductoData[] = [];
  cargando: boolean = true;
  cargandoBoton: boolean = false;  // para cambiar el texto del botón

  formularioCheckout: FormGroup;
  enviado: boolean = false;
  estado: number = 0;
  respuesta: string = 'Ha ocurrido un error';

  constructor(
    public carritoService: CarritoService,
    public authService: Auth,
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.formularioCheckout = this.fb.group({
      // datos personales
      nombre            : ['', [Validators.required, Validators.minLength(3)]],
      correo            : ['', [Validators.required, Validators.minLength(3)]],
      fecha_nacimiento  : ['', [Validators.required, edadMinimaValidator(13)]],
      // envío
      direccion         : ['', [Validators.required, Validators.minLength(3)]],
      ciudad            : ['', [Validators.required, Validators.minLength(3)]],
      region            : [null, [Validators.required]],
      nombre_contacto   : ['', [Validators.required, Validators.minLength(3)]],
      telefono_contacto : ['', [Validators.required, Validators.minLength(8), Validators.maxLength(9)]],
      // pago
      tipo_pago         : ['', [Validators.required]]
    });

    const usuarioActual = this.authService.usuarioActual;
    if(usuarioActual) {
      this.formularioCheckout.patchValue({
        nombre            : usuarioActual.name,
        correo            : usuarioActual.email,
        fecha_nacimiento  : getFechaStr(usuarioActual.birthdate),
        direccion         : usuarioActual.address,
        nombre_contacto   : usuarioActual.name,
      });

      this.formularioCheckout.get('nombre')?.disable();
      this.formularioCheckout.get('correo')?.disable();
      this.formularioCheckout.get('fecha_nacimiento')?.disable();
    }
  }

  get controles(): { [key: string]: AbstractControl } {
    return this.formularioCheckout.controls;
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.formularioCheckout.get(nombreCampo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }

  ngOnInit(): void {
    this.cargarProductos();
  }


  /**
   * Procesa la compra del carrito actual.
   * Valida el formulario, obtiene la información del usuario y del carrito,
   * construye el pedido y lo envía al servicio que crea el pedido.
   * Si es exitosa, redirige a la página de inicio; si no muestra el mensaje de error.
   */
  checkout(): void {

    if(this.formularioCheckout.invalid) {
      this.enviado = true;
      this.formularioCheckout.markAllAsTouched();
      this.respuesta = getHtmlErrores(obtenerErroresFormulario(this.controles, this.formularioCheckout));
      return;
    }

    this.cargandoBoton = true;

    // revisa carrito
    const carritoActual = this.carritoService.carritoActual;
    if(!carritoActual) {
      this.enviado = true;
      this.formularioCheckout.markAllAsTouched();
      this.respuesta = getHtmlErrores([this.respuesta]);
      return;
    }

    // asigna  valor para var usuario_id
    const usuarioActual = this.authService.usuarioActual;
    let usuario_id = null;
    if(usuarioActual) {
      usuario_id = usuarioActual.id;
    }


    const { nombre, correo, fecha_nacimiento, direccion, ciudad, region, nombre_contacto, telefono_contacto, tipo_pago } = this.formularioCheckout.getRawValue() as {
      nombre            : string;
      correo            : string;
      fecha_nacimiento  : string;
      direccion         : string;
      ciudad            : string;
      region            : string;
      nombre_contacto   : string;
      telefono_contacto : string;
      tipo_pago         : string;
    }
    
    const tipo_pago_string = tipo_pago === '1' ? 'tarjeta' : tipo_pago === '2' ? 'webpay' : '';

    let detalle_pedido: ProductoCarrito[] = [];
    this.productosCarrito.forEach((producto_carrito, index) => {
      detalle_pedido.push({
        producto_id     : producto_carrito.producto_id,
        nombre          : producto_carrito.nombre,
        slug            : producto_carrito.slug,
        imagen          : producto_carrito.imagen,
        cantidad        : producto_carrito.cantidad,
        precio          : producto_carrito.precio,
        monto_descuento : producto_carrito.monto_descuento
      });
    });

    const detalle_envio: DetalleEnvio = {
      direccion         : direccion,
      ciudad            : ciudad,
      region            : region,
      nombre_contacto   : nombre_contacto,
      telefono_contacto : telefono_contacto
    }
    
    setTimeout(() => {
      this.pedidoService.agregarPedido(
        usuario_id,
        nombre,
        correo,
        fecha_nacimiento,
        this.es_vip,
        carritoActual.id,
        'Pago confirmado',
        detalle_envio,
        tipo_pago_string,
        detalle_pedido,
        this.resumenCarrito
      ).subscribe(resultado => {
        
        this.enviado = true;
        
        this.estado = resultado.estado;    
        if(this.estado === 1) {
          
          this.respuesta = resultado.respuesta;
          toastSuccess(this.respuesta);       
          this.router.navigate(['/']);
        
        } else {
          
          this.cargandoBoton = false;
          // toastError(this.respuesta);
          this.respuesta = getHtmlErrores([resultado.respuesta]);
          return;
        
        }
      });
    }, 3000);
  }


  /**
   * Carga los productos desde la API y actualiza la información del carrito actual.
   * Si existe un carrito activo, obtiene el detalle de los productos y calcula el resumen de la compra.
   */
  cargarProductos(): void {
    this.productoService.apiObtenerProductos().subscribe({
      next: (datos) => {
        this.productos = datos;
        this.cargando = false;

        this.carritoService.carritoActual$.subscribe(carrito => {
          if(!carrito) {
            this.productosCarrito = [];
            return;
          }

          this.productosCarrito = obtenerProductoCarrito(carrito.detalles, this.productos);

          this.es_vip = this.authService.esVip;
          this.resumenCarrito = calcularResumen(this.productosCarrito, this.es_vip);
        });

        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
      }
    })
  }

}
