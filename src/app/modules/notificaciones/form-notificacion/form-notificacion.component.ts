import { NgModule, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ViewChild, Sanitizer   } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin, Observable, of } from 'rxjs';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger, query, group } from '@angular/animations';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AngularEditorModule,AngularEditorConfig } from '@grantmk/angular-editor';

import { Notificaciones, FiltroNoti, FilterString } from '../../../interfaces/notificacion.interface';
import { NotificacionesServices } from '../../../services/notificacion.service';
import { UtilsGeneral } from '../../../shared/utils/utils-general';

@Component({
    selector: 'app-form-notificacion',
    templateUrl: './form-notificacion.component.html',
    encapsulation: ViewEncapsulation.None
})

export class FormNotificacionComponent implements OnInit {
    @Input() breadcumb: string = "";
    @Input() action: string = "";
    @Input() data: Notificaciones;

    @Output() flagViewCards = new EventEmitter<string>();
    @ViewChild(FormNotificacionComponent) table: FormNotificacionComponent | any;
    
    titleForm : string;
    active = 1;
    dataForm: FormGroup;
    htmlPreview: SafeHtml;
    valueContentCorreo: string;
    htmlContentNotif: string;
    editorConfig: AngularEditorConfig;

    constructor(
        private fb: FormBuilder,
        private apiService: NotificacionesServices,
        private toastr: ToastrService,
        private sanitizer: DomSanitizer,
        private classGeneral: UtilsGeneral) {
            this.titleForm = "Agregar";
    }

    ngOnInit() {
       console.log("Formulario");
        this.validateForms();
    }

     viewCards(){
        this.flagViewCards.emit("cancel");
    }

    configuracion(){
      this.editorConfig = editorConfig;
    }

    validateForms(){
        switch (this.action) {
            case 'add':
                this.active = 1;
                this.titleForm = "Agregar";
                this.dataForm = this.fb.group({
                    codigo: ['', [Validators.required]],
                    tipo: ['', [Validators.required]],
                    canal: ['', [Validators.required]]
                });
                break;
            case 'edit':
                this.active = 1;
                this.titleForm = "Editar";
                this.dataForm = this.fb.group({
                    codigo: ['', [Validators.required]],
                    tipo: ['', [Validators.required]],
                    canal: ['', [Validators.required]]
                });
                break;
            default:
                break;
        }

        this.asignarData();
    }

    asignarData(){
      if(this.action == "edit") {
        this.dataForm.controls["codigo"].setValue(this.data.codigo);
        this.dataForm.controls["tipo"].setValue(this.data.tipo);
        this.dataForm.controls["canal"].setValue(this.data.canal);
        this.htmlContentNotif = this.data.plantilla;
      }
    }

    async createRegistro(){
        var insertarData: Notificaciones = {
            notificacionId : 0,
            codigo : this.dataForm.controls['codigo'].value,
            tipo : this.dataForm.controls['tipo'].value,
            canal : this.dataForm.controls['canal'].value,
            plantilla : this.concatenarPlantilla(this.htmlContentNotif),
            usuarioCreacion : "admin",
            estado: true
        }

        var resp = await this.apiService.create(insertarData).toPromise()
        .then(res => {
            if(res && res["id"] != "0"){
              this.classGeneral.showNotificationNotify(2, "top", "right", res["message"]);//"success", 
                //this.showNotification(2, "top", "right", res["message"]);//"success", );
                this.flagViewCards.emit("reload");
            }
        })
        .catch((err) => {
          this.classGeneral.showNotificationNotify(4, "top","right", "Error al registrar la información");
            //this.showNotification(4, "top","right", "Error al registrar la información");
        });
        
    }

    async editRegistro(){
        var editData: Notificaciones = {
            notificacionId: this.data.notificacionId,
            codigo : this.dataForm.controls['codigo'].value,
            tipo : this.dataForm.controls['tipo'].value,
            canal : this.dataForm.controls['canal'].value,
            plantilla : this.concatenarPlantilla(this.htmlContentNotif),
            usuarioCreacion : "admin",
            usuarioModificacion : "admin",
            estado: true
        }

        var resp = await this.apiService.edit(editData).toPromise()
        .then(res => {
            if(res && res["id"] != "0"){
              this.classGeneral.showNotificationNotify(2, "top", "right", res["message"]);
                //this.showNotification(2, "top", "right", res["message"]);
                this.flagViewCards.emit("reload");
            }
        })
        .catch((err) => {
          this.classGeneral.showNotificationNotify(4, "top", "right", "Error al editar el registro");
            //this.showNotification(4, "top", "right", "Error al editar el registro");
        });
    }

    async resetearClave(){
        
    }

    preview(event: KeyboardEvent){
      const htmlbase = this.dataForm.controls["plantilla"].value;
      this.htmlPreview = this.sanitizer.bypassSecurityTrustHtml(htmlbase);
    }

  soloNumeros(event: KeyboardEvent) {
        const pattern = /^[0-9]$/;
        const inputChar = event.key;

        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    concatenarPlantilla(body?: string): string{
      var elemento: string =  this.ObtenerContenidoElemento(body);
      console.log(elemento);
      const miHtml = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <style>
                  body {
                      margin: 0;
                      padding: 0;
                      background-color: #f4f6f8;
                      font-family: Arial, Helvetica, sans-serif;
                      color: #333333;
                  }
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      background-color: #ffffff;
                      border-radius: 8px;
                      overflow: hidden;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                  }
                  .header {
                      background-color: #0fa4a9;
                      padding: 20px;
                      text-align: center;
                  }
                  .header img {
                      max-width: 180px;
                  }
                  .content {
                      padding: 30px;
                  }
                  .content h1 {
                      color: #0fa4a9;
                      font-size: 22px;
                      margin-bottom: 15px;
                  }
                  .content p {
                      font-size: 15px;
                      line-height: 1.6;
                      margin-bottom: 15px;
                  }
                  .details {
                  background-color: #f7fbfc;
                  border: 1px solid #d9eef0;
                  border-radius: 6px;
                  padding: 20px;
                  margin: 20px 0;
                  font-size: 15px;
                  }
                  .details p {
                      margin: 6px 0;
                  }
                  .button {
                      display: inline-block;
                      padding: 12px 24px;
                      background-color: #0fa4a9;
                      color: #ffffff !important;
                      text-decoration: none;
                      border-radius: 5px;
                      font-weight: bold;
                      margin: 20px 0;
                  }
                  .alertBoxEmail {
                      background-color: #fff4e5;
                      border-left: 4px solid #ff9800;
                      padding: 12px;
                      font-size: 14px;
                      margin-top: 20px;
                      color: #000000;
                  }
                  .footer {
                      background-color: #f0f2f4;
                      padding: 15px;
                      text-align: center;
                      font-size: 12px;
                      color: #777777;
                  }
              </style>
          </head>
          <body>
            ${elemento}
          </body>
          </html>`;

        return miHtml;
    }

    ObtenerContenidoElemento(html: string): string {
            var elemento: string = "";
            var parser = new DOMParser;
            const doc = parser.parseFromString(html, 'text/html');
                
            elemento = doc.querySelector("body").innerHTML;
                
            return elemento;
        }
}

export const editorConfig: AngularEditorConfig = {
  editable: true,
  spellcheck: true,

  height: '350px',
  minHeight: '200px',
  maxHeight: '600px',

  width: 'auto',
  minWidth: '0',

  placeholder: 'Escriba o pegue aquí la plantilla HTML...',
  defaultParagraphSeparator: 'p',

  sanitize: false, // 🔴 IMPORTANTE: evita que Angular quite estilos inline

  toolbarPosition: 'top',
  toolbarHiddenButtons: [
    ['insertImage', 'insertVideo']
  ],

  fonts: [
    { class: 'arial', name: 'Arial' },
    { class: 'times-new-roman', name: 'Times New Roman' },
    { class: 'calibri', name: 'Calibri' }
  ],

  customClasses: [
    {
      name: 'Título',
      class: 'title',
      tag: 'h1'
    },
    {
      name: 'Texto resaltado',
      class: 'highlight',
      tag: 'span'
    }
  ],

  uploadUrl: '', // si no usas imágenes
};
