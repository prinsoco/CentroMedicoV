
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
import { ActivatedRoute } from '@angular/router';
import { FiltroRecuperar } from '../../../interfaces/notificacion.interface';
import { NotificacionesServices } from 'app/services/notificacion.service';

@Component({
  selector: 'app-recuperacionadmin',
  templateUrl: './recuperacionadmin.component.html',
  styleUrls: ['./recuperacionadmin.component.scss']
})
export class RecuperacionAdminComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  invalidLogin: boolean;
  emailRequerido: boolean;
  emailError: number;
  textSpinner = "Cargando...";
  registroExitoso: boolean;


  constructor(private fb: FormBuilder,
    private apiService: NotificacionesServices,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private spinner : NgxSpinnerService,
    private classGeneral: UtilsGeneral
  ) {
    this.emailRequerido = false;
    this.emailError = 0;
    this.registroExitoso = false;
  }

  ngOnInit(): void {
    //this.textSpinner = "Generando recuperación...";
    this.iniciaForm();
  }

  //#region Recuperación contraseña paciente
  iniciaForm(){
     this.loginForm = this.fb.group({
      tipoUsuario: ['', [Validators.required]],
      emailuser: ['', [Validators.required, Validators.email]]
    });

    this.loginForm.controls["tipoUsuario"].setValue("0");
  }

  validarFrom() {
    const emailPass = this.loginForm.controls["emailuser"].errors;
 
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
  }

  async onSubmit(){
    
    if (!this.loginForm.invalid) {

      const tipousu = this.loginForm.controls["tipoUsuario"].value;
      if(tipousu == "0")
      {
        this.classGeneral.showNotificationNotify(3, "top","right", "Debe seleccionar el tipo de usuario");
        return;
      }

          var filtro: FiltroRecuperar = {
            correo: this.loginForm.controls["emailuser"].value,
            tipo: tipousu
          }
    
          var resp = await this.apiService.recuperarclave(filtro).toPromise()
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


  }
  //#endregion
  
}
