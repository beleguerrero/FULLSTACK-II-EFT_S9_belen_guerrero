import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SerVip } from './ser-vip';
import { Usuario } from '../../services/modelos';
import { Auth } from '../../services/auth';

describe('SerVip', () => {
  let component: SerVip;
  let fixture: ComponentFixture<SerVip>;
  let httpMock: HttpTestingController;

  const urlUsuarios = 'http://localhost:3000/usuarios';
  const urlUsuariosVip = 'http://localhost:3000/usuarios_vip';

  const usuarioMock: Usuario = {
      'id': '1',
      'name': 'Edward Cullen',
      'username': 'edward_cullen',
      'email': 'edward@correo.cl',
      'pass': 'Edward123',
      'birthdate': new Date('1901-01-20'),
      'address': 'La mansión Cullen',
      'role': 'BÁSICO'
    };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([])
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SerVip);
    component = fixture.componentInstance;
    
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });


  it('should create', () => {
    httpMock.expectOne(urlUsuarios).flush([usuarioMock]);
    httpMock.expectOne(urlUsuariosVip).flush([]);
    expect(component).toBeTruthy();
  });


  // error de campo en el formulario
  it('debe tener error de número de tarjeta por formato incorrecto', () => {
    httpMock.expectOne(urlUsuarios).flush([usuarioMock]);
    httpMock.expectOne(urlUsuariosVip).flush([]);

    const n_tarjeta = component.formularioSerVip.controls['n_tarjeta'];

    n_tarjeta.setValue('123');

    expect(n_tarjeta.valid).toBeFalsy();
    expect(n_tarjeta.hasError('minlength')).toBeTruthy();
  });


  // registrar vip
  it('debe ser formulario válido y crear un usuario vip cuando los campos cumplen las reglas', () => {
    httpMock.expectOne(urlUsuarios).flush([usuarioMock]);
    httpMock.expectOne(urlUsuariosVip).flush([]);
    
    const authService = TestBed.inject(Auth);
    authService.guardarSesion(usuarioMock);

    component.formularioSerVip.controls['n_tarjeta'].setValue('1111222233334444');
    component.formularioSerVip.controls['duracion'].setValue('1');
    component.formularioSerVip.controls['terminos'].setValue(true);

    component.serVip();

    // método post
    const postReq = httpMock.expectOne(urlUsuariosVip);
    expect(postReq.request.method).toBe('POST');
    postReq.flush({
      id          : '1',
      usuario_id  : '1',
      card_number : '1111222233334444',
      start_date  : new Date(),
      end_date    : new Date(),
    });

    // método put
    const putReq = httpMock.expectOne(`${urlUsuarios}/1`);
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({
      ...usuarioMock,
      role: 'VIP'
    });

    expect(component.estado).toBe(1);
    expect(component.respuesta).toBe('Usuario actualizado correctamente');
  });
});
