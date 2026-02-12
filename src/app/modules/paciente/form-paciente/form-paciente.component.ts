import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { NotifierService } from 'angular-notifier';
//import { NgxSpinnerService } from 'ngx-spinner';
import { formatDate } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgModule, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger, query, group } from '@angular/animations';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
//import { tree } from 'd3';
import { ToastrService } from "ngx-toastr";

import { Paciente, Filtro, FilterString,  } from '../../../interfaces/paciente.interface';
import { environment } from '../../../../environments/environment';
import { PacienteServices } from '../../../services/paciente.service';
import { UtilsGeneral } from '../../../shared/utils/utils-general';

@Component({
    selector: 'app-form-paciente',
    templateUrl: './form-paciente.component.html',
    encapsulation: ViewEncapsulation.None
})

export class FormPacienteComponent implements OnInit {
    @Input() breadcumb: string = "";
    @Input() action: string = "";
    @Input() data: Paciente;

    @Output() flagViewCards = new EventEmitter<string>();
    @ViewChild(FormPacienteComponent) table: FormPacienteComponent | any;
    
    titleForm : string;
    active = 1;
    dataForm: FormGroup;
    ValidacionUsuario: string;

    constructor(
        private fb: FormBuilder,
        private apiService: PacienteServices,
        private toastr: ToastrService,
        private classGeneral: UtilsGeneral) {
            this.titleForm = "Agregar";
    }

    ngOnInit() {
       console.log("Formulario");
        this.validateForms();
    }

     viewCards(){
        this.breadcumb="Administración > Intermediarios";
        this.flagViewCards.emit("cancel");
    }

    validateForms(){
        switch (this.action) {
            case 'add':
                this.active = 1;
                this.titleForm = "Agregar";
                this.dataForm = this.fb.group({
                    nombres: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+( [A-Za-z]+)?$/)]],
                    apellidos: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+( [A-Za-z]+)?$/)]],
                    identificacion: ['', [Validators.required]],
                    usuario: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
                    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/)]],
                    edad: [''],
                    telefono: [''],
                    celular: [''],
                    direccion: [''],
                    notificacion:['']
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
                    email: [this.data.email, [Validators.required]],
                    edad: [this.data.edad],
                    telefono: [this.data.telefono],
                    celular: [this.data.celular],
                    direccion: [this.data.direccion],
                    notificacion:[this.data.notificacion]
                });
                break;
            default:
                break;
        }
    }

    createRegistro(){
        this.apiService.getByUser(this.dataForm.controls['usuario'].value).subscribe(resp => {
          if (resp != null){
            this.ValidacionUsuario = "";
            this.InsertarPaciente();
          }
          else{
            this.ValidacionUsuario = "Usuario ya existe asignado a otro Paciente";
          }
        }); 
    }

    async InsertarPaciente(){
        var insertarData: Paciente = {
            pacienteId : 0,
            nombres : this.dataForm.controls['nombres'].value,
            apellidos : this.dataForm.controls['apellidos'].value,
            identificacion : this.dataForm.controls['identificacion'].value,
            usuario : this.dataForm.controls['usuario'].value.replace(',','.'),
            email : this.dataForm.controls['email'].value,
            edad : this.dataForm.controls['edad'].value,
            telefono : this.dataForm.controls['telefono'].value,
            celular : this.dataForm.controls['celular'].value,
            direccion : this.dataForm.controls['direccion'].value,
            usuarioCreacion : "admin",
            clave:this.dataForm.controls['identificacion'].value,
            estado: true
        }

        const notif = this.dataForm.controls['notificacion'].value;
        console.log(notif);
        if(notif==null || notif=="")
        {
            insertarData.notificacion=false;
        }
        else{
            insertarData.notificacion=true;
        }
        
        var resp = await this.apiService.create(insertarData).toPromise()
        .then(res => {
            if(res && res["id"] != "0"){
                this.classGeneral.showNotificationNotify(2, "top", "right", res["message"]);//"success", );
                this.flagViewCards.emit("reload");
                this.ngOnInit() ;
            }
        })
        .catch((err) => {
            this.classGeneral.showNotificationNotify(4, "top","right", "Error al registrar la información");
        });
        
    }

    async editRegistro(){
        var editData: Paciente = {
            pacienteId: this.data.pacienteId,
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
            usuarioCreacion : "admin",
            usuarioModificacion : "admin",
            estado: true
           
        }

         const notif = this.dataForm.controls['notificacion'].value;
            
            if(notif==null || notif=="")
            {
                editData.notificacion=false;
            }
            else{
                editData.notificacion=true;
            }
        var resp = await this.apiService.edit(editData).toPromise()
        .then(res => {
            if(res && res["id"] != "0"){
                this.classGeneral.showNotificationNotify(2, "top", "right", res["message"]);
                this.flagViewCards.emit("reload");
                this.ngOnInit() ;
            }
        })
        .catch((err) => {
            this.classGeneral.showNotificationNotify(4, "top", "right", "Error al editar el registro");
        });
    }

    async resetearClave(){
        
    }

  soloNumeros(event: KeyboardEvent) {
        const pattern = /^[0-9]$/;
        const inputChar = event.key;

        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }
}