import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from '../../environments/environment';
import { Paciente, IResponseDataPaciente, Filtro, FiltroPaciente } from "../interfaces/paciente.interface";
import { LoginAut, LoginFiltro } from "../interfaces/login.interface";

@Injectable({
    providedIn: 'root'
  })

  export class AutorizacionServices {
    token: any;
    invalidLogin: boolean;
    public prefix: string = `${environment.services.authServices}`;
    constructor(private http: HttpClient, private router: Router) { this.token = localStorage.getItem("jwt"); this.invalidLogin = false; }

    public login(input: LoginFiltro, servicesUser: string){
        const httpOptions = {
            headers: new HttpHeaders({'Content-Type': 'application/json'})
          }
        let url_ = `${this.prefix}/${servicesUser}/login`;
        return this.http.post(url_, input, httpOptions);
    }
}