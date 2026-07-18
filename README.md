# RottenAppleAngular
Actividad Sumativa 3: Consumiendo API Rest
 
## Tecnologías
- Angular
- TypeScript
- Bootstrap
- HTML
- CSS
- Reactive Forms
- Sweet Alert
- json-server
 
## Instalación
```bash
npm install
```

## Ejecución Local
```bash
ng serve
```

## Ejecución json-server Local
```bash
npx json-server@0.17.4 --watch db.json --port 3000
```

## Ejecución Docker
```bash
docker compose up --build -d
```

## Detener y eliminar contenedores Docker
```bash
docker compose down
```


## Pruebas unitarias
```bash
ng test
```

## Documentación
Para generar documentación
```bash
npm run docs
```
Para visualizar documentación
```bash
npm run docs:serve
```
Para eliminar documentación (elimina directorio documentation)
```bash
rmdir /s /q documentation
```



## Datos de prueba
Usuario para pruebas (contiene productos en el carrito y un pedido de ejemplo):  
**prueba@micorreo.cl**  
**Prueba123**  


## Datos consumidos
- **CarritoService**
    - url: http://localhost:3000/carritos
    - Consumo de los carritos de compra.
- **PedidoService**
    - url: http://localhost:3000/pedidos
    - Consumo de los pedidos.
- **ProductoService**
    - url: http://localhost:3000/productos
    - url: http://localhost:3000/categorias
    - lectura de los productos y categorías.
- **UsuarioService**
    - url: http://localhost:3000/usuarios
    - url: http://localhost:3000/usuarios_vip
    - Consumo de los usuarios y usuarios vip.
- **Auth**
    - sin url, llama servicions de UsuarioService.



## Autor
Belén Guerrero A.
