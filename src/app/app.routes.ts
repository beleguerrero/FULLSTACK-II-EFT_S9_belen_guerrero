import { Routes } from '@angular/router';

import { Inicio } from './pages/inicio/inicio';
import { Registro } from './pages/registro/registro';
import { Grilla } from './pages/grilla/grilla';
import { Producto } from './pages/producto/producto';
import { Login } from './pages/login/login';
import { SerVip } from './pages/ser-vip/ser-vip';
import { MiCuenta } from './pages/mi-cuenta/mi-cuenta';
import { Recuperar } from './pages/recuperar/recuperar';
import { Carrito } from './pages/carrito/carrito';
import { Checkout } from './pages/checkout/checkout';
import { MisCompras } from './pages/mis-compras/mis-compras';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
    {
        path: '',
        component: Inicio,
        title: 'Rotten Apple'
    },
    {
        path: 'registro',
        component: Registro,
        title: 'Rotten Apple - Registro'
    },
    {
        path: 'login',
        component: Login,
        title: 'Rotten Apple - Login'
    },
    {
        path: 'producto/:slug',
        component: Producto,
        title: 'Rotten Apple'
    },
    {
        path: 'categoria/:slug',
        component: Grilla,
        title: 'Rotten Apple'
    },
    {
        path: 'ser-vip',
        component: SerVip,
        title: 'Rotten Apple'
    },
    {
        path: 'mi-cuenta',
        component: MiCuenta,
        title: 'Rotten Apple'
    },
    {
        path: 'recuperar',
        component: Recuperar,
        title: 'Rotten Apple'
    },
    {
        path: 'carrito',
        component: Carrito,
        title: 'Rotten Apple'
    },
    {
        path: 'checkout',
        component: Checkout,
        title: 'Rotten Apple'
    },
    {
        path: 'mis-compras',
        component: MisCompras,
        title: 'Rotten Apple'
    },

    {
        path: '404',
        component: NotFound
    },
    {
        path: '**',
        redirectTo: '404'
    },
];
