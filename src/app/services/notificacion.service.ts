import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { Notificaciones, IResponseDataNoti, FiltroNoti } from "../interfaces/notificacion.interface";

@Injectable({
    providedIn: 'root'
  })

  export class NotificacionesServices {
    token: any;
    public prefix: string = `${environment.services.notificacionService}`;
    constructor(private http: HttpClient, private route: ActivatedRoute) { this.token = localStorage.getItem("jwt"); }

    public create(input: Notificaciones){
        const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
        let url_ = `${this.prefix}crear` ;

        return this.http.post(url_, input, {headers: headers});
    }

    public getAll(filtros: FiltroNoti) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
        .set('input', filtros.input);
        let url_ = `${this.prefix}getAll` ;

        return this.http.get<IResponseDataNoti<Notificaciones[]>>(url_, {headers: headers});
    }

    public edit(input: Notificaciones) {
        let url_ = `${this.prefix}update` ;
        return this.http.put(url_, input);
    }

    public getById(id: number) {

        const headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token); 
        return this.http.get<IResponseDataNoti<Notificaciones[]>>(`${this.prefix}getById/${id}`, {headers: headers});
    }
}