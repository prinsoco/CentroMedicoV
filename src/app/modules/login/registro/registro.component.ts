
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginAut, LoginFiltro } from '../../../interfaces/login.interface';
import { AutorizacionServices } from '../../../services/autorizacion.service';
import { Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilsGeneral } from '../../../shared/utils/utils-general';
import { PacienteServices } from '../../../services/paciente.service';
import { Paciente } from 'app/interfaces/paciente.interface';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  invalidLogin: boolean;
  emailRequerido: boolean;
  emailError: number;
  passRequerido: boolean;
  passMinLen: boolean;
  passError: number;
  textSpinner = "Cargando...";
  nombreRequerido: boolean;
  nombreError: number;
  identRequerido: boolean;
  identError: number;
  apellidoRequerido: boolean;
  apellidoError: number;
  edadRequerido: boolean;
  edadError: number;
  identMinLen: boolean;
  celRequerido: boolean;
  celError: number;
  registroExitoso: boolean;


  constructor(private fb: FormBuilder,
    private apiService: PacienteServices,
    private apiServAut: AutorizacionServices, 
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
    this.apellidoError = 0;
    this.apellidoRequerido = false;
    this.edadError = 0;
    this.edadRequerido = false;
    this.nombreError = 0;
    this.nombreRequerido = false;
    this.apellidoError = 0;
    this.apellidoRequerido = false;
    this.identError = 0;
    this.identMinLen = false;
    this.identRequerido = false;
    this.celRequerido = false
    this.celError = 0;
    this.registroExitoso = false;
  }

  ngOnInit(): void {
    this.textSpinner = "Generando registro...";
      this.iniciaForm();
  }

  iniciaForm(){
     this.loginForm = this.fb.group({
      emailuser: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      identificacion: ['', [Validators.required]],
      edad: ['', [Validators.required]],
      celular: ['', [Validators.required]]
    });
  }

  validarFrom() {
    const emailPass = this.loginForm.controls["emailuser"].errors;
    const errorPass = this.loginForm.controls["password"].errors;
    const errorNombre = this.loginForm.controls["nombre"].errors;
    const errorApellido = this.loginForm.controls["apellido"].errors;
    const errorIdent = this.loginForm.controls["identificacion"].errors;
    const errorEdad = this.loginForm.controls["edad"].errors;
    const errorCel = this.loginForm.controls["celular"].errors;

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

    //nombre
    if(errorNombre != null && errorNombre != undefined){
      this.nombreError = 1;

      if(errorNombre.required != undefined && errorNombre.required){
        this.nombreRequerido = true;
      }
      else{
        this.nombreRequerido = false;
      }
    }
    else{
      this.nombreError = 0;
    }

    //apellido
    if(errorApellido != null && errorApellido != undefined){
      this.apellidoError = 1;

      if(errorApellido.required != undefined && errorApellido.required){
        this.apellidoRequerido = true;
      }
      else{
        this.apellidoRequerido = false;
      }
    }
    else{
      this.apellidoError = 0;
    }

    //apellido
    if(errorIdent != null && errorIdent != undefined){
      this.identError = 1;

      if(errorIdent.required != undefined && errorIdent.required){
        this.identRequerido = true;
      }
      else{
        this.identRequerido = false;
      }

      if(errorIdent.minlength != undefined && errorIdent.minlength.actualLength < 10){
        this.identMinLen = true;
      }
      else{
        this.identMinLen = false;
      }
    }
    else{
      this.identError = 0;
    }

    if(errorEdad != null && errorEdad != undefined){
      this.edadError = 1;

      if(errorEdad.required != undefined && errorEdad.required){
        this.edadRequerido = true;
      }
      else{
        this.edadRequerido = false;
      }
    }
    else{
      this.edadError = 0;
    }

    if(errorCel != null && errorCel != undefined){
      this.celError = 1;

      if(errorCel.required != undefined && errorCel.required){
        this.celRequerido = true;
      }
      else{
        this.celRequerido = false;
      }
    }
    else{
      this.celError = 0;
    }
  }

  async onSubmit() {
    this.spinner.show();
    this.submitted = true;
    if (!this.loginForm.invalid) {
      var crear: Paciente = {
        clave: this.loginForm.controls["password"].value,
        apellidos: this.loginForm.controls["apellido"].value,
        nombres: this.loginForm.controls["nombre"].value,
        edad: this.loginForm.controls["edad"].value,
        identificacion: this.loginForm.controls["identificacion"].value,
        email: this.loginForm.controls["emailuser"].value,
        celular: this.loginForm.controls["celular"].value,
        usuarioCreacion: 'admin',
        estado: true
      }

      const email = crear.email;
      const usuario = email.split('@')[0];
      crear.usuario = usuario;

      var resp = await this.apiService.create(crear).toPromise()
        .then(res => {
            if(res && res["id"] == "-1"){
                this.classGeneral.showNotificationNotify(3, "top", "right", res["message"]);//"success", );
                this.spinner.hide();
            }
            else if(res && parseInt(res["id"]+"") > 0){
              this.spinner.hide();
                this.classGeneral.showNotificationNotify(2, "top", "right", res["message"]);//"success", );
                this.registroExitoso = true;
            }
        })
        .catch((err) => {
            this.classGeneral.showNotificationNotify(4, "top","right", "Error al registrar el paciente");
            this.spinner.hide();
        });

      
    }
    else{
      this.spinner.hide();
      this.validarFrom();
    }

    console.log('Login data:', this.loginForm.value);
  }

  reiniciarVariables(){

  }
}
