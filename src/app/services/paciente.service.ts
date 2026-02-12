import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { Paciente, IResponseDataPaciente, Filtro, FiltroPaciente } from "../interfaces/paciente.interface";
import { FiltroExcel } from "../interfaces/utils.interface";

@Injectable({
    providedIn: 'root'
  })

  export class PacienteServices {
    token: any;
    public prefix: string = `${environment.services.pacienteService}`;
    constructor(private http: HttpClient, private route: ActivatedRoute) { this.token = localStorage.getItem("jwt"); }

    public create(input: Paciente){
        const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
        let url_ = `${this.prefix}crear` ;

        return this.http.post(url_, input, {headers: headers});
    }

    public getAll(filtros: FiltroPaciente) {
        let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
        .set('input', filtros.input)
        .set('combo', filtros.combo)
        .set('especialidadId', filtros.especialidadId ?? "")
        .set('medicoId', filtros.medicoId ?? "")
        .set('reporte', filtros.reporte ?? "");
        let url_ = `${this.prefix}getAll` ;

        return this.http.get<IResponseDataPaciente<Paciente[]>>(url_, {headers: headers});
    }

    public edit(input: Paciente) {
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
        return this.http.get<IResponseDataPaciente<Paciente>>(`${this.prefix}getById/${id}`, {headers: headers});
    } 

    public getByUser(user: string) {
    
        const headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token)
        .set('user', user); 
        return this.http.get<IResponseDataPaciente<Paciente>>(`${this.prefix}getByUser`, {headers: headers});
    }

    public getDownload(input: FiltroExcel){
            const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
            let url_ = `${this.prefix}getDownload` ;

            return this.http.post(url_, input, {
                    responseType: 'blob',
                        headers: new HttpHeaders({'Content-Type': 'application/json'})
                        .set('Authorization', `Bearer ` + this.token)
                        });
            
            
    }

    public getAllDownload(input: FiltroExcel){
            const headers = new HttpHeaders().set('Ahthorization', `Bearer ` + this.token);
            let url_ = `${this.prefix}getDownload` ;
            
            return this.http.post(url_, input, {headers: headers});
            
    }
}