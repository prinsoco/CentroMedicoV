import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { Usuario, IResponseDataUsuario, Filtro } from "../interfaces/usuario.interface";

@Injectable({
    providedIn: 'root'
  })

  export class UsuarioServices {
    token: any;
    public prefix: string = `${environment.services.usuarioService}`;
    constructor(private http: HttpClient, private route: ActivatedRoute) { this.token = localStorage.getItem("jwt"); }

    public create(input: Usuario){
        const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
        let url_ = `${this.prefix}crear` ;

        return this.http.post(url_, input, {headers: headers});
    }

    public getAll(filtros: Filtro) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
        .set('input', filtros.input);
        let url_ = `${this.prefix}getAll` ;

        return this.http.get<IResponseDataUsuario<Usuario[]>>(url_, {headers: headers});
    }

    public edit(input: Usuario) {
        let url_ = `${this.prefix}update` ;
        return this.http.put(url_, input);
    }
public delete(id:number, usuarioModificacion:string)
        {
            const url = `${this.prefix}delete/${id}?usuarioModificacion=${usuarioModificacion}`; 
            return this.http.delete(url);        
        }
    public getById(id: number) {

        const headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token); 
        return this.http.get<IResponseDataUsuario<Usuario[]>>(`${this.prefix}getById/${id}`, {headers: headers});
    }
    
    public getByUser(user: string) {

        const headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
        .set('user', user); 
        return this.http.get<IResponseDataUsuario<Usuario>>(`${this.prefix}getByUser`, {headers: headers});
    }
  }