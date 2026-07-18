import { Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";

import { ProductoData, CategoriaData } from "./modelos";

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
	private readonly urlCategorias = 'http://localhost:3000/categorias';
	private readonly urlProductos = 'http://localhost:3000/productos';

	constructor(
		private readonly http: HttpClient
	) {}

	/**
	 * Obtiene lista de productos desde la API.
	 * @returns Observable con array de los productos.
	 */
	apiObtenerProductos(): Observable<ProductoData[]> {
		return this.http.get<ProductoData[]>(this.urlProductos);
	}


	/**
	 * Obtiene un producto por su slug desde la API.
	 * @param slug String con el slug para identificar al producto.
	 * @returns Observable con el producto encontrado, puede ser nulo.
	 */
	apiObtenerProductoPorSlug(slug: string): Observable<ProductoData | null> {
		return this.http.get<ProductoData[]>(`${this.urlProductos}?slug=${slug}`).pipe(
			map(productos => productos[0] ?? null)
		)
	}


	/**
	 * Obtiene a los productos por su Id de categoría desde la API.
	 * @param categoria_id String con el ID de categoría de los productos.
	 * @returns Observable con los productos encontrados, puede ser nulo.
	 */
	apiObtenerProductosPorCategoria(categoria_id: string): Observable<ProductoData[] | null> {
		return this.http.get<ProductoData[]>(`${this.urlProductos}?category_id=${categoria_id}`).pipe(
			map(productos => productos ?? null)
		)
	}
	
	
	
	/**
	 * Obtiene lista de las categorías desde la API.
	 * @returns Observable con array de las categorías.
	 */
	apiObtenerCategorias(): Observable<CategoriaData[]> {
		return this.http.get<CategoriaData[]>(this.urlCategorias);
	}


	/**
	 * Obtiene una categorpia por su slug desde la API.
	 * @param slug Strin con el slug para identificar a la categoría.
	 * @returns Observable con la categoria encontrada, puede ser nulo.
	 */
	apiObtenerCategoriaPorSlug(slug:string): Observable<CategoriaData | null> {
		return this.http.get<CategoriaData[]>(`${this.urlCategorias}?slug=${slug}`).pipe(
			map(categorias => categorias[0] ?? null)
		)
	}


	/**
	 * Obtiene una categoría por su ID desde la API.
	 * @param categoria_id String con el ID de categoría.
	 * @returns Observable con la categoría encontrada, puede ser nulo.
	 */
	apiObtenerCategoriaPorId(categoria_id: string): Observable<CategoriaData | null> {
		return this.http.get<CategoriaData[]>(`${this.urlCategorias}?id=${categoria_id}`).pipe(
			map(categorias => categorias[0] ?? null)
		)
	}
}
