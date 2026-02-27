
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
  selector: 'app-claveadmin',
  templateUrl: './claveadmin.component.html',
  styleUrls: ['./claveadmin.component.scss']
})
export class ClaveAdminComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  invalidLogin: boolean;
  emailRequerido: boolean;
  emailError: number;
  textSpinner = "Cargando...";
  registroExitoso: boolean;
  token: string;


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
    this.route.queryParams
    .subscribe(params => {
      this.token = params['token'];
      console.log('Token:',this.token);
    });
  }

  //#region Recuperación contraseña paciente
  iniciaForm(){
     this.loginForm = this.fb.group({
      tipoUsuario: ['', [Validators.required]],
      clave: ['', [Validators.required]]
    });

    this.loginForm.controls["tipoUsuario"].setValue("0");
  }

  async onSubmit(){

      const tipousu = this.loginForm.controls["tipoUsuario"].value;
      const clave = this.loginForm.controls["clave"].value;
      if(tipousu == "0")
      {
        this.classGeneral.showNotificationNotify(3, "top","right", "Debe seleccionar el tipo de usuario");
        return;
      }

      if(!clave)
      {
        this.classGeneral.showNotificationNotify(3, "top","right", "Ingrese la clave");
        return;
      }

          var filtro: FiltroRecuperar = {
            correo: "",
            tipo: tipousu,
            token: this.token,
            clave: clave
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
  //#endregion
  
}
