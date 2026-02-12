import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { NotifierService } from 'angular-notifier';
//import { NgxSpinnerService } from 'ngx-spinner';
import { formatDate } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgModule, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger, query, group } from '@angular/animations';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
//import { tree } from 'd3';
import { ToastrService } from "ngx-toastr";
import {  } from 'rxjs';

import { Medico, Filtro, FilterString,  } from '../../../interfaces/medico.interface';
import { environment } from '../../../../environments/environment';
import { MedicoServices } from '../../../services/medico.service';
import { PerfilServices } from '../../../services/perfil.service';
import { Perfil, FiltroPerfil  } from '../../../interfaces/rolxperfil.interface';
import { EspecialidadServices } from '../../../services/especialidad.service';
import { Especialidad, FiltroEspecialidad  } from '../../../interfaces/especialidad.interface';
import { UtilsGeneral } from '../../../shared/utils/utils-general';
import { EmailValidoDirective } from '../../../shared/utils/utils-email';


@Component({
    selector: 'app-form-medico',
    templateUrl: './form-medico.component.html',
    encapsulation: ViewEncapsulation.None
})

export class FormMedicoComponent implements OnInit {
    @Input() breadcumb: string = "";
    @Input() action: string = "";
    @Input() data: Medico;

    @Output() flagViewCards = new EventEmitter<string>();
    @ViewChild(FormMedicoComponent) table: FormMedicoComponent | any;
    
    perfil: Perfil;
    titleForm : string;
    active = 1;
    dataForm: FormGroup;
    arrayDataPerfil: Perfil[];
    arrayDataEspecialidad: Especialidad[];
    ValidacionUsuario: string
    emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
    emailPatterns = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    emailPatterns1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    ValidacionEmail: string;
    tipoPerfil?: string;
    userId?: number;

    constructor(
        private fb: FormBuilder,
        private apiService: MedicoServices,
        private apiServicePerfil: PerfilServices,
        private apiServiceEsp: EspecialidadServices,
        private utils: UtilsGeneral,
        private email: EmailValidoDirective,
        private toastr: ToastrService) {
            this.titleForm = "Agregar";
    }

    ngOnInit() {
       console.log("Formulario");
       this.validaUserLogin();
        this.validateForms();
        this.getAllPerfiles();
        this.getAllEspecialidades();
        this.asignarData();
    }

     viewCards(){
        this.breadcumb="Administración > Intermediarios";
        this.flagViewCards.emit("cancel");
    }

    getAllPerfiles(){
        try {
            this.arrayDataPerfil = [];

            var filtro: FiltroPerfil = {
                input: "",
                combo: "S"
            }
            
            this.apiServicePerfil.getAll(filtro).subscribe(resp => {
              this.arrayDataPerfil = resp?.data ?? [];
              this.perfil = this.arrayDataPerfil.find(c => c.codigo == "COD_MED");
              this.asignarData();
            });
              
        } catch (error) {
            console.log(error);
        }
    }

    getAllEspecialidades(){
        try {
            this.arrayDataEspecialidad = [];

            var filtro: FiltroEspecialidad = {
                input: "",
                combo: "S"
            }
            
            this.apiServiceEsp.getAll(filtro).subscribe(resp => {
              this.arrayDataEspecialidad = resp?.data ?? [];
              this.asignarData();
            });

        } catch (error) {
            console.log(error);
        }
      }

    validateForms(){
        switch (this.action) {
            case 'add':
                this.active = 1;
                this.titleForm = "Agregar";
                this.dataForm = this.fb.group({
                    nombres: ['', [Validators.required]],
                    apellidos: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$/)]],
                    identificacion: ['', [Validators.required]],
                    usuario: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
                    email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
                    edad: [''],
                    telefono: [''],
                    celular: [''],
                    direccion: [''],
                    perfil: [{ value: '', disabled: true}, [Validators.required]],
                    especialidad: [{ value: '' }, [Validators.required]]
                });
                break;
            case 'edit':
                this.active = 1;
                this.titleForm = "Editar";
                this.dataForm = this.fb.group({
                    nombres: [this.data.nombres, [Validators.required]],
                    apellidos: [this.data.apellidos, [Validators.required]],
                    identificacion: [this.data.identificacion, [Validators.required]],
                    usuario: [{ value: this.data.usuario, disabled: true }, [Validators.required]],
                    email: [this.data.email, [Validators.required, Validators.pattern(this.emailPattern)]],
                    edad: [this.data.edad],
                    telefono: [this.data.telefono],
                    celular: [this.data.celular],
                    direccion: [this.data.direccion],
                    perfil: [{ value: this.data.perfilId, disabled: true },[Validators.required]],
                    especialidad: [{ value: this.data.especialidadId }, [Validators.required]]
                });
                break;
            default:
                break;
        }
    }

    asignarData(){
      switch (this.action) {
            case 'add':
                this.dataForm.controls['perfil'].setValue(this.perfil?.perfilId);
                this.dataForm.controls['especialidad'].setValue("0");
                break;
            case 'edit':
                this.dataForm.controls['perfil'].setValue(this.data.perfilId);
                this.dataForm.controls['especialidad'].setValue(this.data.especialidadId);
                break;
            default:
                break;
        }
    }

    createRegistro(){
        this.apiService.getByUser(this.dataForm.controls['usuario'].value).subscribe(resp => {
          if (resp != null && resp.data != null){
            this.ValidacionUsuario = "Usuario ya existe asignado a otro Médico";
          }
          else{
            this.ValidacionUsuario = "";
            this.InsertarMedico();
          }
        }); 
    }

    async InsertarMedico(){
      var insertarData: Medico = {
            medicoId : 0,
            nombres : this.dataForm.controls['nombres'].value,
            apellidos : this.dataForm.controls['apellidos'].value,
            identificacion : this.dataForm.controls['identificacion'].value,
            usuario : this.dataForm.controls['usuario'].value.replace(',','.'),
            email : this.dataForm.controls['email'].value,
            edad : this.dataForm.controls['edad'].value,
            telefono : this.dataForm.controls['telefono'].value,
            celular : this.dataForm.controls['celular'].value,
            direccion : this.dataForm.controls['direccion'].value,
            especialidadId : this.dataForm.controls['especialidad'].value,
            perfilId : this.dataForm.controls['perfil'].value,
            usuarioCreacion : "admin",
            estado: true
        }

        var resp = await this.apiService.create(insertarData).toPromise()
        .then(res => {
            if(res && res["id"] != "0"){
                this.utils.showNotificationNotify(2, "top", "right", res["message"]);//"success", );
                this.flagViewCards.emit("reload");
            }
        })
        .catch((err) => {
            this.utils.showNotificationNotify(4, "top","right", "Error al registrar la información");
        });
    }

    async editRegistro(){
        var editData: Medico = {
            medicoId: this.data.medicoId,
            perfilId: this.data.perfilId,
            nombres : this.dataForm.controls['nombres'].value,
            apellidos : this.dataForm.controls['apellidos'].value,
            identificacion : this.dataForm.controls['identificacion'].value,
            usuario : this.dataForm.controls['usuario'].value.replace(',','.'),
            email : this.dataForm.controls['email'].value,
            edad : this.dataForm.controls['edad'].value,
            telefono : this.dataForm.controls['telefono'].value,
            celular : this.dataForm.controls['celular'].value,
            direccion : this.dataForm.controls['direccion'].value,
            especialidadId : this.dataForm.controls['especialidad'].value,
            usuarioCreacion : "admin",
            usuarioModificacion : "admin",
            estado: true
        }

        var resp = await this.apiService.edit(editData).toPromise()
        .then(res => {
            if(res && res["id"] != "0"){
                this.utils.showNotificationNotify(2, "top", "right", res["message"]);
                this.flagViewCards.emit("reload");
            }
        })
        .catch((err) => {
            this.utils.showNotificationNotify(4, "top", "right", "Error al editar el registro");
        });
    }

    async resetearClave(){
        
    }

  soloNumeros(event: KeyboardEvent) {
        /*const pattern = /^[0-9]$/;
        const inputChar = event.key;

        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }*/
       this.utils.soloNumeros(event);
    }

    soloLetra(event: KeyboardEvent) {
        this.utils.onlyLettersNoSpaces(event);
    }

    emailOnkeyDown(event: KeyboardEvent){
      const email = this.email.isValidEmail(this.dataForm.controls["email"].value);
      console.log(email);
      if(email)
      {
        this.ValidacionEmail = "";
      }
      else{
        this.ValidacionEmail = "Se requiere correo electrónico y el formato debe ser tucorreo@doe.com.";
      }
    }

    emailonBlur(event: FocusEvent){
      this.email.onBlur(event);

    }

    validaUserLogin(){
      const token = localStorage.getItem('token');
      const usuario = localStorage.getItem('loginUsuario');
      const userId = localStorage.getItem('loginId');
      const perfilId = localStorage.getItem('loginPerfilId');
      const perfil = localStorage.getItem('loginPerfil');
      const time = localStorage.getItem('time');

      if(usuario && perfil && userId){
          this.tipoPerfil = perfil;
          this.userId = parseInt(userId);
      }
      else{
        console.log("sin datos");
      }
    }
}