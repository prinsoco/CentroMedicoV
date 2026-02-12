import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { Parametros, IResponseDataParametros, FiltroParam } from "../interfaces/parametros.interface";

@Injectable({
    providedIn: 'root'
  })

  export class ParametroServices {
    token: any;
    public prefix: string = `${environment.services.parametroService}`;
    constructor(private http: HttpClient, private route: ActivatedRoute) { this.token = localStorage.getItem("jwt"); }

    public create(input: Parametros){
        const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
        let url_ = `${this.prefix}crear` ;

        return this.http.post(url_, input, {headers: headers});
    }

    public getAll(filtros: FiltroParam) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
        .set('input', filtros.input ?? "")
        .set('combo', filtros.combo ?? "")
        .set('tipo', filtros.tipo ?? "")
        .set('codigo', filtros.codigo ?? "");

        let url_ = `${this.prefix}getAll` ;

        return this.http.get<IResponseDataParametros<Parametros[]>>(url_, {headers: headers});
    }

    public edit(input: Parametros) {
        let url_ = `${this.prefix}update` ;
        return this.http.put(url_, input);
    }

    public getById(id: number) {

        const headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token); 
        return this.http.get<IResponseDataParametros<Parametros[]>>(`${this.prefix}/getById/${id}`, {headers: headers});
    } 
  }