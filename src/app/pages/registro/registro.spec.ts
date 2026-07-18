import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Registro } from './registro';

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;
  let httpMock: HttpTestingController;

  const urlUsuarios = 'http://localhost:3000/usuarios';
  const urlUsuariosVip = 'http://localhost:3000/usuarios_vip';

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

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;

    httpMock = TestBed.inject(HttpTestingController);

  });
  afterEach(() => {
    httpMock.verify();
  })

  it('should create', () => {
    httpMock.expectOne(urlUsuarios).flush([]);
    httpMock.expectOne(urlUsuariosVip).flush([]);
    expect(component).toBeTruthy();
  });

  // error de campo en el formulario
  it('debe tener error de correo por formato incorrecto', () => {
    httpMock.expectOne(urlUsuarios).flush([]);
    httpMock.expectOne(urlUsuariosVip).flush([]);

    const correo = component.formularioRegistro.controls['correo'];

    correo.setValue('correo.invalido');

    expect(correo.valid).toBeFalsy();
    expect(correo.hasError('email')).toBeTruthy();
  });


  // registrar usuario
  it('debe ser formulario válido y crear un usuario cuando los campos cumplen las reglas', () => {
    httpMock.expectOne(urlUsuarios).flush([]);
    httpMock.expectOne(urlUsuariosVip).flush([]);

    component.formularioRegistro.controls['nombre'].setValue('Edward Cullen');
    component.formularioRegistro.controls['usuario'].setValue('edward_cullen');
    component.formularioRegistro.controls['correo'].setValue('edward@correo.cl');
    component.formularioRegistro.controls['pass'].setValue('Edward123');
    component.formularioRegistro.controls['re_pass'].setValue('Edward123');
    component.formularioRegistro.controls['fecha_nacimiento'].setValue('1901-01-20');
    component.formularioRegistro.controls['direccion'].setValue('La mansión Cullen');

    component.registrar();

    // método post
    const postReq = httpMock.expectOne(urlUsuarios);
    expect(postReq.request.method).toBe('POST');
    postReq.flush({
      id        : '1',
      name      : 'Edward Cullen',
      username  : 'edward_cullen',
      email     : 'edward@correo.cl',
      pass      : 'Edward123',
      birthdate : '1901-01-20',
      address   : 'La mansión Cullen',
      role      : 'BÁSICO',
    });

    expect(component.estado).toBe(1);
    expect(component.respuesta).toBe('Usuario creado correctamente');
  });
});

