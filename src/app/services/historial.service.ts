import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { FiltroHistorial, HistorialClinico, IResponseDataHistorial } from "../interfaces/historial.interface";

@Injectable({
    providedIn: 'root'
  })

  export class HistorialServices {
    token: any;
    public prefix: string = `${environment.services.historialServices}`;
    constructor(private http: HttpClient, private route: ActivatedRoute) { this.token = localStorage.getItem("jwt"); }

    public create(input: HistorialClinico){
            const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
            let url_ = `${this.prefix}crear` ;
    
            return this.http.post(url_, input, {headers: headers});
        }
    
    public edit(input: HistorialClinico) {
            let url_ = `${this.prefix}update` ;
            return this.http.put(url_, input);
        }

  public getAll(filtros: FiltroHistorial) {
          let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
          .set("pacienteId", filtros.pacienteId ?? "")
          .set("citaId", filtros.citaId ?? "")
          .set("medicoId", filtros.medicoId+"" );

          let url_ = `${this.prefix}getAll` ;
  
          return this.http.get<IResponseDataHistorial<HistorialClinico[]>>(url_, {headers: headers});
      }

      public getById(id: number) {
      
              const headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token); 
              return this.http.get<IResponseDataHistorial<HistorialClinico>>(`${this.prefix}getById/${id}`, {headers: headers});
          } 
}