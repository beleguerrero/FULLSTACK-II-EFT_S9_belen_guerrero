import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CarritoService } from './carrito-service';
import { CarritoData } from './modelos';

describe('CarritoService', () => {
  let service: CarritoService;
  let httpMock: HttpTestingController;

  const urlCarritos = 'http://localhost:3000/carritos';
  const urlUsuarios = 'http://localhost:3000/usuarios';
  const urlUsuariosVip = 'http://localhost:3000/usuarios_vip';

  const carritoMock: CarritoData = {
    'id': '1',
    'usuario_id': '1',
    'activo': true,
    'detalles': [
      {
          'producto_id': '1',
          'cantidad': 1
      },
      {
          'producto_id': '2',
          'cantidad': 10
      }
    ]
  };


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CarritoService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(CarritoService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  })
  

  it('should be created', () => {
    httpMock.expectOne(urlUsuarios).flush([]);
    httpMock.expectOne(urlUsuariosVip).flush([]);
    httpMock.expectOne(urlCarritos).flush([carritoMock]);

    expect(service).toBeTruthy();
  });


  it('debe incrementar la cantidad de un producto ya en el carrito', () => {
    httpMock.expectOne(urlUsuarios).flush([]);
    httpMock.expectOne(urlUsuariosVip).flush([]);
    httpMock.expectOne(urlCarritos).flush([carritoMock]);

    service.actualizarCantidadCarrito('1', '1', null).subscribe(resultado => {
      expect(resultado.estado).toBe(1);
    });


    // método put
    const putReq = httpMock.expectOne(`${urlCarritos}/1`);
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body.detalles[0].cantidad).toBe(2);
    putReq.flush({
      ...carritoMock,
      detalles: [
        { producto_id: '1', cantidad: 2 }
      ]
    });

    // método get
    const getReq = httpMock.expectOne(`${urlCarritos}?activo=true&usuario_id=1`);
    getReq.flush([
      {
        ...carritoMock,
        detalles: [
          {
            producto_id: '1',
            cantidad: 2
          }
        ]
      }
    ]);
  });


  it('debe retornar 0 cuando se quiere agregar el "11" producto, no permite más de 10', () => {
    httpMock.expectOne(urlUsuarios).flush([]);
    httpMock.expectOne(urlUsuariosVip).flush([]);
    httpMock.expectOne(urlCarritos).flush([carritoMock]);

    service.actualizarCantidadCarrito('1', '2', null).subscribe(resultado => {
      expect(resultado.estado).toBe(0);
      expect(resultado.respuesta).toBe('No puede agregar más del mismo producto');
    });
  });
});
