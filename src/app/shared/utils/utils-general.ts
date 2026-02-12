import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable,Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginAut } from "../../interfaces/login.interface";
import { ToastrService } from "ngx-toastr";
import { Router } from '@angular/router';

declare var $:any;

@Injectable({
    providedIn: 'root'
  })

  export class UtilsGeneral {
    datoLogin: LoginAut;
    tColor?: string;

    constructor(private route: ActivatedRoute,
      private toastr: ToastrService,
      private router: Router
    ) { }

    public soloNumeros(event: KeyboardEvent){
            const pattern = /^[0-9]$/;
        const inputChar = event.key;

        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
      }

       /** Valida si solo contiene letras y espacios */
  onlyLetters(value: string): boolean {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
    return regex.test(value.trim());
  }

  onlyLettersNoSpaces(event: KeyboardEvent) {
    const pattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;
        const inputChar = event.key;

        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
  }

  isValidEmail(email: string): boolean {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email.trim());
  }

  public fechaLocal(date: Date | string): string {
    const d = new Date(date);
    console.log(d);
    const y = d.getFullYear();
    console.log(y);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    console.log(m);
    const day = String(d.getDate()).padStart(2, '0');
    console.log(day);
    return `${y}-${m}-${day}`;
  }

  obtenerHora(fechaHora: string | Date): string {
    if (!fechaHora) return '';

    const fecha = new Date(fechaHora);

    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');

    return `${horas}:${minutos}`;
  }

  public generarListFeriados(feriados: any[]): string[] {
    if (!feriados || feriados.length === 0) {
      return [];
    }

    return feriados.map(f => {
      const anio = f.anio.toString().padStart(4, '0');
      const mes = f.mes.toString().padStart(2, '0');
      const dia = f.dia.toString().padStart(2, '0');
      return `${anio}-${mes}-${dia}`;
    });
  }

  public closeModal(modalService: NgbModal){
    modalService.dismissAll();
  }

  public showNotification(color: number, from, align, mensaje: string) {

    switch (color) {
      case 1:
        this.toastr.info(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + mensaje + '</span>',
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-info alert-with-icon",
            positionClass: "toast-" + from + "-" + align
          }
        );
        break;
      case 2:
        this.toastr.success(
          '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + mensaje + '</span>',
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-success alert-with-icon",
            positionClass: "toast-" + from + "-" + align
          }
        );
        break;
      case 3:
        this.toastr.warning(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + mensaje + '</span>',
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-warning alert-with-icon",
            positionClass: "toast-" + from + "-" + align
          }
        );
        break;
      case 4:
        this.toastr.error(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + mensaje + '</span>',
          "",
          {
            timeOut: 4000,
            enableHtml: true,
            closeButton: true,
            toastClass: "alert alert-danger alert-with-icon",
            positionClass: "toast-" + from + "-" + align
          }
        );
        break;
      case 5:
        this.toastr.show(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + mensaje + '</span>',
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-primary alert-with-icon",
            positionClass: "toast-" + from + "-" + align
          }
        );
        break;
      default:
        break;
    }
}

public showNotificationNotify(color: number, from, align, mensaje: string){
        var type = ['','info','success','warning','danger'];
        
        switch (color) {
          case 1:
            this.tColor = type[color];
            break;
          case 2:
            this.tColor = type[color];
            break;
          case 3:
            this.tColor = type[color];
            break;
          case 4:
            this.tColor = type[color];
            break;
          case 5:
            this.tColor = '';
            break;
          default:
            break;
        }

    	$.notify({
        	icon: "ti-gift",
        	message: mensaje
        },{
            type: this.tColor,
            timer: 4000,
            placement: {
                from: from,
                align: align
            },
            template: '<div data-notify="container" class="col-11 col-md-4 alert alert-{0} alert-with-icon" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss"><i class="nc-icon nc-simple-remove"></i></button><span data-notify="icon" class="nc-icon nc-bell-55"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'
        });
	}

public colorCalender(): string{
      return "#FFFFFF"
  }

  public validaUserLogin(): LoginAut {
    
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('loginUsuario');
    const userId = localStorage.getItem('loginId');
    const perfilId = localStorage.getItem('loginPerfilId');
    const perfil = localStorage.getItem('loginPerfil');
    const time = localStorage.getItem('time');
    const especialidad = localStorage.getItem('loginEspecialidad');

    if(usuario && perfil && userId){
      this.datoLogin = {
        loginPerfil: perfil,
        loginId: parseInt(userId),
        loginUsuario: usuario,
        token: token,
        loginPerfilId: parseInt(perfilId),
        time: time,
        loginEspecialidad:parseInt(especialidad)
      }
    }
    else{
      this.datoLogin = {};
      console.log("sin datos");
    }

    return this.datoLogin;
  }

  public cerrarSesion(){
    const usuario = localStorage.getItem('loginUsuario');
    const perfil = localStorage.getItem('loginPerfil');
    localStorage.clear();
    if(perfil && perfil === "P"){
            this.router.navigate(["/user/login"]);
    }
    else{
      this.router.navigate(["/admin/login"]);
    }
    
  }

  public recortarTexto(texto: string, limite: number = 100): string {
  if (!texto) {
    return '';
  }

  return texto.length > limite
    ? texto.substring(0, limite) + '...'
    : texto;
}

}