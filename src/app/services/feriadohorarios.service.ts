import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { Feriado, FiltroFeriado, IResponseDataFeriado } from "../interfaces/feriadohorarios.interface";

@Injectable({
    providedIn: 'root'
  })

  export class FeriadoHorariosServices {
    token: any;
    public prefix: string = `${environment.services.feriado}`;
    constructor(private http: HttpClient, private route: ActivatedRoute) { this.token = localStorage.getItem("jwt"); }

    public create(input: Feriado){
            const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
            let url_ = `${this.prefix}crear` ;
    
            return this.http.post(url_, input, {headers: headers});
        }
    
        public getAll(filtros: FiltroFeriado) {
            let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
            .set('anio', filtros.anio ?? "");
            let url_ = `${this.prefix}getAll` ;
    
            return this.http.get<IResponseDataFeriado<Feriado[]>>(url_, {headers: headers});
        }
    
        public edit(input: Feriado) {
            let url_ = `${this.prefix}update` ;
            return this.http.put(url_, input);
        }

        public delete(id:number)
        {
            const url = `${this.prefix}delete/${id}`; 
            return this.http.delete(url);        
        }

        public getById(id: number) {
    
            const headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token); 
            return this.http.get<IResponseDataFeriado<Feriado[]>>(`${this.prefix}getById/${id}`, {headers: headers});
        }
  }