import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { Citas, IResponseDataCita, Filtro, Horarios, HorariosMedico, Cita, FiltroCitaAsig } from "../interfaces/citas.interface";
import { Doctor } from "../interfaces/medico.interface";
import { FiltroExcel } from "../interfaces/utils.interface";

@Injectable({
    providedIn: 'root'
  })

  export class CitasServices {
    token: any;
    public prefix: string = `${environment.services.horarioServices}`;
    public prefixCita: string = `${environment.services.citasServices}`;
    constructor(private http: HttpClient, private route: ActivatedRoute) { this.token = localStorage.getItem("jwt"); }

    public create(input: Cita){
            const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
            let url_ = `${this.prefixCita}crear` ;
    
            return this.http.post(url_, input, {headers: headers});
        }
    
    public edit(input: Cita) {
            let url_ = `${this.prefixCita}update` ;
            return this.http.put(url_, input);
        }

    public getDoctores() {
    return this.http.get<Doctor[]>('assets/data/doctores.json');
  }

  public getHorarios() {
    return this.http.get<Horarios[]>('assets/data/horarios.json');
  }

  public getFeriados() {
    return this.http.get<string[]>('assets/data/feriados.json');
  }

  public getMes() {
    return this.http.get<string[]>('assets/data/meses.json');
  }

  public getAll(filtros: FiltroCitaAsig) {
          let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
          .set("input", filtros.input ?? "")
          .set("combo", filtros.combo ?? "")
          .set("medicoId", filtros.medicoId+"")
          .set("pacienteId", filtros.paciente+"")
          .set("especialidaId", filtros.especialidadId+"")
          .set("fechaInicio", filtros.fechaInicio)
          .set("fechaFin", filtros.fechaFin)
          .set("reporte", filtros.reporte ?? "");

          let url_ = `${this.prefixCita}getAll` ;
  
          return this.http.get<IResponseDataCita<Cita[]>>(url_, {headers: headers});
      }

   public getAllHorario(medicoId: string, especialidadId: string, paciente?: string, fecha?: string) {
          let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
          .set('medicoId', medicoId)
          .set('especialidadId', especialidadId)
          .set('pacienteId', paciente ?? "0");

          if(fecha != null){          
            headers.set('fechaDia', fecha ?? "");
          }

          let url_ = `${this.prefix}Horarios` ;
  
          return this.http.get<IResponseDataCita<HorariosMedico[]>>(url_, {headers: headers});
      }

      public getAllFeriados(anios?: string) {
          let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
          .set('anios', anios ?? "");
          let url_ = `${this.prefix}Feriados` ;
  
          return this.http.get<IResponseDataCita<HorariosMedico[]>>(url_, {headers: headers});
      }

      public getDownload(input: FiltroExcel){
                  const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
                  let url_ = `${this.prefixCita}getDownload` ;
      
                  return this.http.post(url_, input, {
                          responseType: 'blob',
                              headers: new HttpHeaders({'Content-Type': 'application/json'})
                              .set('Authorization', `Bearer ` + this.token)
                              });
                  
                  
          }
      
          public getAllDownload(input: FiltroExcel){
                  const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
                  let url_ = `${this.prefixCita}getDownload` ;
                  
                  return this.http.post(url_, input, {headers: headers});
                  
          }
}