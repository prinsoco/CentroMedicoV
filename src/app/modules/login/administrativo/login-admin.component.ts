import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginAut, LoginFiltro } from '../../../interfaces/login.interface';
import { AutorizacionServices } from '../../../services/autorizacion.service';
import { Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilsGeneral } from '../../../shared/utils/utils-general';

@Component({
  selector: 'app-login-admin',
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.scss']
})
export class LoginAdminComponent implements OnInit {
  loginFormAd: FormGroup;
  submitted = false;
  invalidLogin: boolean;
  emailRequerido: boolean;
  emailError: number;
  passRequerido: boolean;
  passMinLen: boolean;
  passError: number;
  tusuario: boolean;
  tusuarioError: number;
  textSpinner = "Cargando...";

  constructor(private fb: FormBuilder,
    private apiService: AutorizacionServices,
    private router: Router,
    private toastr: ToastrService,
    private spinner : NgxSpinnerService,
    private classGeneral: UtilsGeneral
  ) {
    this.emailRequerido = false;
    this.emailError = 0;
    this.passMinLen = false;
    this.passError = 0;
    this.passRequerido = false;
    this.tusuario = false;
    this.tusuarioError = 0;
  }

  ngOnInit(): void {
    this.textSpinner = "Cargando...";
      this.iniciaForm();
  }

  iniciaForm(){
     this.loginFormAd = this.fb.group({
      tipoUsuario: ['', [Validators.required]],
      emailuser: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loginFormAd.controls["tipoUsuario"].setValue('0');
  }

  validarFrom() {
    const emailPass = this.loginFormAd.controls["emailuser"].errors;
    const errorPass = this.loginFormAd.controls["password"].errors;
    const tipoUsuario = this.loginFormAd.controls["tipoUsuario"].value;

    if(emailPass != null && emailPass != undefined){
      this.emailError = 1;

      if(emailPass.required != undefined && emailPass.required){
        this.emailRequerido = true;
      }
      else{
        this.emailRequerido = false;
      }
    }
    else{
      this.emailError = 0;
    }

    if(errorPass != null && errorPass != undefined){
      this.passError = 1;
      
      if(errorPass.required != undefined && errorPass.required){
        this.passRequerido = true;
      }
      else{
        this.passRequerido = false;
      }

      if(errorPass.minlength != undefined && errorPass.minlength.actualLength < 6){
        this.passMinLen = true;
      }
      else{
        this.passMinLen = false;
      }
    }
    else{
      this.passError = 0;
    }

    if(tipoUsuario === "0"){
      this.tusuario = true;
      this.tusuarioError = 1;
    }
    else{
      this.tusuario = false;
      this.tusuarioError = 0;
    }
  }

  async onSubmit() {
    this.spinner.show();
    this.submitted = true;
    if (!this.loginFormAd.invalid) {
      var filtro: LoginFiltro = {
        clave: this.loginFormAd.controls["password"].value,
        usuarioEmail: this.loginFormAd.controls["emailuser"].value,
        tipoUsuario: this.loginFormAd.controls["tipoUsuario"].value
      }

      var resp = await this.apiService.login(filtro, filtro?.tipoUsuario?.toString() == "A" ? "Usuario" : "Medico").toPromise()
      .then(res => {
        this.invalidLogin = false;
        const infoLogin = (<LoginAut>res);
        const tipoUsuario = (<LoginAut>res).loginPerfil;
        const code = (<LoginAut>res).codigo;
        const mensaje = (<LoginAut>res).mensaje;
              
        if(code && code === 9999){
          this.spinner.hide();
          this.classGeneral.showNotificationNotify(4, "top","right", "Usuario o clave incorrecto");
          //this.showNotification(4, "top","right", "Usuario o clave incorrecto");
        }
        else{
          localStorage.setItem("jwt", infoLogin.token);
          localStorage.setItem("loginApellidos", infoLogin.loginApellidos);
          localStorage.setItem("loginNombre", infoLogin.loginNombre);
          localStorage.setItem("loginIdentificacion", infoLogin.loginIdentificacion);
          localStorage.setItem("loginUsuario", infoLogin.loginUsuario);
          localStorage.setItem("loginId", infoLogin.loginId?.toString() ?? "");
          localStorage.setItem("loginPerfilId", infoLogin.loginPerfilId?.toString() ?? "");
          localStorage.setItem("loginPerfil", infoLogin.loginPerfil);
          localStorage.setItem("loginDescPerfil", infoLogin.loginDescPerfil);
          localStorage.setItem("loginExpToken", infoLogin.loginExpToken?.toString() ?? "");
          localStorage.setItem("loginFecUltLogin", infoLogin.loginFecUltLogin?.toString() ?? "");
          localStorage.setItem("time", infoLogin.time);
          localStorage.setItem("lastLogin", infoLogin.lastLogin);
          localStorage.setItem("loginEspecialidad", infoLogin.loginEspecialidad?.toString() ?? "0");
          
          this.spinner.hide();
          this.router.navigate(["/dashboard"]);
        }
      })
      .catch((err) => {
        this.invalidLogin = true;
        this.spinner.hide();
        if(err.status == '504'){
          this.classGeneral.showNotificationNotify(4, "top","right", "Sistema no disponible");
          //this.showNotification(4, "top","right", "Sistema no disponible");
        }else if(err.status == 0){
          this.classGeneral.showNotificationNotify(3, "top","right", "Credenciales no válidas");
          //this.showNotification(3, "top","right", "Credenciales no válidas");
        }
        else{
          this.classGeneral.showNotificationNotify(3, "top","right", "Error en autenticacion");
          //this.showNotification(3, "top","right", "Error en autenticacion");
        }
      });
    }
    else{
      this.validarFrom();
      this.spinner.hide();
    }

    console.log('Login data:', this.loginFormAd.value);
  }

  irAdministrativo() {
      event.preventDefault(); // Evita que navegue por href="#"
      console.log('Click en administrativo');

      // Aquí tu lógica
      // Ej: validar rol, luego redirigir:
      // this.router.navigate(['/dashboard']);
    }
}
