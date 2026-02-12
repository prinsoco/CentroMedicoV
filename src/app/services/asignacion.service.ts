import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { IResponseData, SubMenu } from "../interfaces/menu.interface";
import { Menu } from "../interfaces/menu.interface";
import { RouteInfo } from "../sidebar/sidebar.component";
import { AsignacionDto, FiltroAsignacion } from "../interfaces/asignacion.interface";

@Injectable({
    providedIn: 'root'
  })

  export class AsignacionServices {
    token: any;
    public prefix: string = `${environment.services.asignacion}`;
    constructor(private http: HttpClient, private route: ActivatedRoute) { this.token = localStorage.getItem("jwt"); }

    //#region  Menu
    public create(input: AsignacionDto){
        const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
        let url_ = `${this.prefix}crear`;

        return this.http.post(url_, input, {headers: headers});
    }

    public getAll(filtros: FiltroAsignacion) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
        .set('input', filtros.input ?? "")
        .set('combo', filtros.combo ?? "")
        .set('perfilId', filtros.perfilId ?? "")
        .set('menuId', filtros.menuId ?? "")
        .set('subMenuId', filtros.subMenuId ?? "")
        .set('estado', filtros.estado ?? "");
        let url_ = `${this.prefix}getAll`;
        
        return this.http.get<IResponseData<AsignacionDto[]>>(url_, {headers: headers});
    }

    public edit(input: AsignacionDto) {
        let url_ = `${this.prefix}update`;
        return this.http.put(url_, input);
    }
    public delete(id:number, usuarioModificacion:string)
    {
        const url = `${this.prefix}delete/${id}?usuarioModificacion=${usuarioModificacion}`; 
        return this.http.delete(url);        
    }

    public getById(id: number) {

        const headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token); 
        let url_ = `${this.prefix}getById/${id}`;
        
        return this.http.get<IResponseData<AsignacionDto>>(url_, {headers: headers});
    } 
    
    //#endregion Fin Menu
}