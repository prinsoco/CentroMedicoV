import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { Especialidad, IResponseDataEspecialidad, Filtro, FiltroEspecialidad } from "../interfaces/especialidad.interface";

@Injectable({
    providedIn: 'root'
  })

  export class EspecialidadServices {
    token: any;
    public prefix: string = `${environment.services.especialidadService}`;
    constructor(private http: HttpClient, private route: ActivatedRoute) { this.token = localStorage.getItem("jwt"); }

    public create(input: Especialidad){
        const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
        let url_ = `${this.prefix}crear` ;

        return this.http.post(url_, input, {headers: headers});
    }

    public getAll(filtros: FiltroEspecialidad) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
        .set('input', filtros.input)
        .set('combo', filtros.combo);
        let url_ = `${this.prefix}getAll` ;

        return this.http.get<IResponseDataEspecialidad<Especialidad[]>>(url_, {headers: headers});
    }

    public edit(input: Especialidad) {
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
        return this.http.get<IResponseDataEspecialidad<Especialidad[]>>(`${this.prefix}/getById/${id}`, {headers: headers});
    } 
  }