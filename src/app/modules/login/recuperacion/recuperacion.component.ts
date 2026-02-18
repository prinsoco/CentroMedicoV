
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginAut, LoginFiltro } from '../../../interfaces/login.interface';
import { AutorizacionServices } from '../../../services/autorizacion.service';
import { Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilsGeneral } from '../../../shared/utils/utils-general';
import { PacienteServices } from '../../../services/paciente.service';
import { MedicoServices } from '../../../services/medico.service';
import { UsuarioServices } from '../../../services/usuario.service';
import { Paciente } from 'app/interfaces/paciente.interface';

@Component({
  selector: 'app-recuperacion',
  templateUrl: './recuperacion.component.html',
  styleUrls: ['./recuperacion.component.scss']
})
export class recuperacionComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  invalidLogin: boolean;
  emailRequerido: boolean;
  emailError: number;
  textSpinner = "Cargando...";
  registroExitoso: boolean;
  tusuario: boolean;
  tusuarioError: number;


  constructor(private fb: FormBuilder,
    private apiService: PacienteServices,
    private apiServiceM: MedicoServices,
    private apiServiceA: UsuarioServices,
    private apiServAut: AutorizacionServices, 
    private router: Router,
    private toastr: ToastrService,
    private spinner : NgxSpinnerService,
    private classGeneral: UtilsGeneral
  ) {
    this.emailRequerido = false;
    this.emailError = 0;
    this.registroExitoso = false;
     this.tusuario = false;
    this.tusuarioError = 0;
  }

  ngOnInit(): void {
    //this.textSpinner = "Generando recuperación...";
    // this.iniciaForm();
  }

  iniciaForm(){
     this.loginForm = this.fb.group({
      tipoUsuario: ['', [Validators.required]],
      emailuser: ['', [Validators.required, Validators.email]],
    });
  }

  validarFrom() {
    const emailPass = this.loginForm.controls["emailuser"].errors;
    const tipoUsuario = this.loginForm.controls["tipoUsuario"].value;
 
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
    if (!this.loginForm.invalid) {
      
    /*  if(this.loginForm.controls['tipoUsuario'].value=="P")
      {
        this.apiService.getByUser(this.loginForm.controls['usuario'].value).subscribe(resp => {
          if (resp != null){
            this.ValidacionUsuario = "";
            this.InsertarPaciente();
          }
          else{
            this.ValidacionUsuario = "Usuario ya existe asignado a otro Paciente";
          }
        });
      }*/
      /*var crear: Paciente = {
        email: this.loginForm.controls["emailuser"].value,
      }
      */
      
      

    }
    else{
      this.spinner.hide();
      this.validarFrom();
    }

    console.log('Login data:', this.loginForm.value);
  }

  
}
