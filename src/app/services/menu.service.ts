import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { IResponseData, SubMenu } from "../interfaces/menu.interface";
import { Menu } from "../interfaces/menu.interface";
import { RouteInfo } from "../sidebar/sidebar.component";

@Injectable({
    providedIn: 'root'
  })

  export class MenuSubServices {
    token: any;
    public prefix: string = `${environment.services.menuServices}`;
    constructor(private http: HttpClient, private route: ActivatedRoute) { this.token = localStorage.getItem("jwt"); }

    //#region  Menu
    public create(input: any, submenu: boolean){
        const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
        let url_ = submenu ? `${this.prefix}crear/submenu` : `${this.prefix}crear`;

        return this.http.post(url_, input, {headers: headers});
    }

    public getAll(filtros: any, submenu?: boolean) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
        .set('input', filtros.input ?? "")
        .set('combo', filtros.combo ?? "")
        .set('tipo', filtros.tipo ?? "")
        .set('menuId', filtros.menuId ?? "");
        let url_ = submenu ? `${this.prefix}getAll/submenu` : `${this.prefix}getAll`;

        if(submenu){
            return this.http.get<IResponseData<SubMenu[]>>(url_, {headers: headers});
        }
        
        return this.http.get<IResponseData<Menu[]>>(url_, {headers: headers});
    }

    public edit(input: any, submenu?: boolean) {
        let url_ = submenu ? `${this.prefix}update/submenu` : `${this.prefix}update`;
        return this.http.put(url_, input);
    }
    public delete(id:number, usuarioModificacion:string)
    {
        const url = `${this.prefix}delete/${id}?usuarioModificacion=${usuarioModificacion}`; 
        return this.http.delete(url);        
    }
    public deleteSubMenu(id:number, usuarioModificacion:string)
    {
        const url = `${this.prefix}delete/submenu/${id}?usuarioModificacion=${usuarioModificacion}`; 
        return this.http.delete(url);        
    }

    public getById(id: number, submenu?: boolean) {

        const headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token); 
        let url_ = submenu ? `${this.prefix}getById/submenu/${id}` : `${this.prefix}getById/${id}`;

        if(submenu){
            return this.http.get<IResponseData<SubMenu>>(url_, {headers: headers});
        }
        
        return this.http.get<IResponseData<Menu>>(url_, {headers: headers});
    } 

    public getAllFront(perfilId?: string) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
        .set('perfilId', perfilId ?? "");
        let url_ = `${this.prefix}getMenuFront`;


        
        return this.http.get<IResponseData<RouteInfo[]>>(url_, {headers: headers});
    }
    
    //#endregion Fin Menu
}