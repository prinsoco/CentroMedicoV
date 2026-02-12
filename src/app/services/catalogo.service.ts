import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { Catalogo, IResponseDataCatalogo, FiltroCat } from "../interfaces/catalogo.interface";

@Injectable({
    providedIn: 'root'
  })

  export class CatalogoServices {
    token: any;
        public prefix: string = `${environment.services.catalogoService}`;
        constructor(private http: HttpClient, private route: ActivatedRoute) { this.token = localStorage.getItem("jwt"); }
    
        public create(input: Catalogo){
            const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
            let url_ = `${this.prefix}crear` ;
    
            return this.http.post(url_, input, {headers: headers});
        }
    
        public getAll(filtros: FiltroCat) {
            let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
            .set('codigo', filtros.codigo ?? "")
            .set('combo', filtros.combo ?? "")
            .set('tipo', filtros.tipo ?? "")
            .set('estado', filtros.estado ?? "");
            let url_ = `${this.prefix}getAll` ;
    
            return this.http.get<IResponseDataCatalogo<Catalogo[]>>(url_, {headers: headers});
        }
    
        public edit(input: Catalogo) {
            let url_ = `${this.prefix}update` ;
            return this.http.put(url_, input);
        }
    
        public getById(id: number) {
    
            const headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token); 
            return this.http.get<IResponseDataCatalogo<Catalogo>>(`${this.prefix}getById/${id}`, {headers: headers});
        } 
    
        public getByUser(user: string) {
        
            const headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
            .set('user', user); 
            return this.http.get<IResponseDataCatalogo<Catalogo>>(`${this.prefix}getByUser`, {headers: headers});
        }
    }