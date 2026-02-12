import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../environments/environment';
import { SeccionOne, IResponseDataDashBoard, Filtro } from "../interfaces/dashboard.interface";

@Injectable({
    providedIn: 'root'
  })

  export class DashBoardServices {
    token: any;
    public prefix: string = `${environment.services.dashboardService}`;
    constructor(private http: HttpClient, private route: ActivatedRoute) { this.token = localStorage.getItem("jwt"); }

    public getSeccionOne() {
        let headers = new HttpHeaders().set('Authorization', `Bearer ` + this.token);
        let url_ = `${this.prefix}seccion-one` ;

        return this.http.get<IResponseDataDashBoard<SeccionOne>>(url_, {headers: headers});
    }
  }