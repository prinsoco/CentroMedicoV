import { NgModule, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger, query, group } from '@angular/animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";

import { Filtro, Especialidad, FiltroEspecialidad } from '../../interfaces/especialidad.interface';
import { EspecialidadServices } from '../../services/especialidad.service';
import { UtilsGeneral } from '../../shared/utils/utils-general';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-especialidades',
    //moduleId: module.id,
    templateUrl: './list-especialidades.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [cardsAnimation()],
})

export class EspecialidadesComponent implements OnInit{
    title: string;
    arrayData: Especialidad[];
    filterArray: Especialidad[] | null = null;
    page: number = 1;
    pageSize: number = 10;
    totfilas: number = 0;
    filtrarTableForm: FormGroup;
    flagViewCards = true;
    flagEditView = false;
    data: Especialidad;
    textDescription = "activar"
    textSpinner = "Cargando..."
    action="add"
    disabled = false;
    breadcumb= "";
    dataForm: FormGroup;
    titleForm: string;
    tipoPerfil?: string;
    userId?: number;
    userName?: string;


    constructor(private apiService: EspecialidadServices,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
      private classGeneral: UtilsGeneral)
        {
            this.title = "Especialidades";
            this.titleForm = "Agregar";
        }

    ngOnInit(){
        this.textSpinner = "Cargando...";
        this.validaUserLogin();
        this.cancelarRegistro();
        this.cargarInfoFiltro();
        this.getAll();
        this.filter();
    }

    //#region: Seccion para mostrar en el grip view
    async getAll(){
        try {
            this.filterArray = [];
            this.arrayData = [];

            var filtro: FiltroEspecialidad = {
                input: "",
                combo: "N"
            }
            var resp = await this.apiService.getAll(filtro).toPromise();
            this.arrayData = resp?.data ?? [];
            this.filterArray = this.arrayData;
            this.totfilas = this.arrayData.length;

        } catch (error) {
            console.log(error);
        }
    }

    cargarInfoFiltro(){
      this.filtrarTableForm = this.fb.group({
            datosFiltro: ['']
        });
    }

    filter(){
        // Hook: cuando se escribe, filtrar automáticamente
        this.filtrarTableForm.get('datosFiltro')?.valueChanges.subscribe(texto => {
            this.filtrarGrid(texto);
        });
    }

    filtrarGrid(texto: string){
        if (!texto) {
            this.filterArray = this.arrayData;
            return;
        }

        texto = texto.toLowerCase();

        this.filterArray = this.arrayData.filter(item =>
            Object.values(item).some(val =>
            val != null && val.toString().toLowerCase().includes(texto)
            )
        );
    }

    //#endregion: seccion grid view

    //#region: seccion editar perfil
    public  showForm(input: Especialidad | null, action: string){
        this.data = input;
        this.textSpinner = "Procesando...";
        this.action = action;
        switch (action) {
          case 'add':
              this.titleForm = "Agregar";
              break;
          default:
              this.titleForm = "Editar";
              this.validateForms("edit");
              break;
        }
    }
    //#endregion: seccion editar

    async createRegistro(){
            var insertarData: Especialidad = {
                especialidadId : 0,
                descripcion : this.dataForm.controls['descripcion'].value,
                observacion : this.dataForm.controls['observacion'].value,
                usuarioCreacion : "admin",
                estado: true
            }
            const notif = this.dataForm.controls['Whatsapp'].value;
            
            if(notif==null || notif=="")
            {
                insertarData.whatsapp=false;
            }
            else{
                insertarData.whatsapp=true;
            }
    
            var resp = await this.apiService.create(insertarData).toPromise()
            .then(res => {
                if(res && res["id"] != "0"){
                    this.classGeneral.showNotificationNotify(2, "top", "right", res["message"]);
                    this.ngOnInit();
                }
            })
            .catch((err) => {
                this.classGeneral.showNotificationNotify(4, "top","right", "Error al registrar la información");
            });
            
        }
    eliminarEspecialidad(id: number, usuarioModificacion: string) 
        {
           this.apiService.delete(id, usuarioModificacion) .subscribe({ next: () => 
            {
               this.classGeneral.showNotificationNotify(2, "top", "right", `Especialidad con ID ${id} eliminado correctamente`);//"success", );
               this.ngOnInit();
            },
             error: (err) => 
              { 
                this.classGeneral.showNotificationNotify(4, "top", "right", `Ocurrió un error al intentar eliminar la especialidad`);//"eror", );
              } });
        }
      showModal(dto:Especialidad){
             Swal.fire({
                title: 'Confirmación eliminación Especialidad',
                text: '¿Está seguro que desea eliminar la especialidad?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
              }).then(result => {
                if (result.isConfirmed) {
                   this.eliminarEspecialidad(dto.especialidadId, this.userName)
                }
              });
          }
        async editRegistro(){
          
            
          var editData: Especialidad = {
                especialidadId: this.data.especialidadId,
                descripcion : this.dataForm.controls['descripcion'].value,
                observacion : this.dataForm.controls['observacion'].value,
                usuarioCreacion : "admin",
                usuarioModificacion : "admin",
                estado: true
                
            }
            const notif = this.dataForm.controls['Whatsapp'].value;
            
              if(notif==null || notif=="")
              {
                  editData.whatsapp=false;
              }
              else{
                  editData.whatsapp=true;
              }
    
            var resp = await this.apiService.edit(editData).toPromise()
            .then(res => {
                if(res && res["id"] != "0"){
                    this.classGeneral.showNotificationNotify(2, "top", "right", res["message"]);
                    this.ngOnInit();
                }
            })
            .catch((err) => {
                this.classGeneral.showNotificationNotify(4, "top", "right", "Error al editar el registro");
            });
        }

        async cancelarRegistro(){
          this.validateForms("add");
        }

        validateForms(action: string){
          this.action = action;
          if (action == "add") {
                this.titleForm = "Agregar";
                this.dataForm = this.fb.group({
                    descripcion: ['', [Validators.required]],
                    observacion: [''],
                    Whatsapp: ['']
                });
        }
        else if (action == "edit"){
          this.titleForm = "Editar";
          this.dataForm = this.fb.group({
                    descripcion: [this.data.descripcion, [Validators.required]],
                    observacion: [this.data.observacion],
                    Whatsapp: [this.data.whatsapp]
                });
        }
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
          this.userName = usuario;  
      }
      else{
        console.log("sin datos");
      }
    }
}

export function cardsAnimation(){
    const left = [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
        group([
          query(':enter', [style({ transform: 'translateX(-100%)' }), animate('3s ease-out', style({ transform: 'translateX(0%)' }))], {
            optional: true,
          }),
          query(':leave', [style({ transform: 'translateX(0%)' }), animate('.3s ease-out', style({ transform: 'translateX(100%)' }))], {
            optional: true,
          }),
        ]),
      ];
    
      const right = [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
        group([
          query(':enter', [style({ transform: 'translateX(100%)' }),
          animate('.3s ease-out', style({ transform: 'translateX(0%)' }))], {
            optional: true,
          }),
          query(':leave', [style({ transform: 'translateX(0%)' }), animate('.3s ease-out', style({ transform: 'translateX(-100%)' }))], {
            optional: true,
          }),
        ]),
      ];


    const top = [
        query(':enter, :leave', style({ position: 'initial', width: '100%' }), { optional: true }),
        group([
          query(':enter', [style({ transform: 'translateY(-100%)' }), animate('.3s ease-out', style({ transform: 'translateY(0%)' }))], {
            optional: true,
          }),
          query(':leave', [style({ transform: 'translateY(0%)' }), animate('.3s ease-out', style({ transform: 'translateY(100%)' }))], {
            optional: true,
          }),
        ]),
      ];
    
      const bottom = [
        query(':enter, :leave', style({ position: 'initial', width: '100%' }), { optional: true }),
        group([
          query(':enter', [style({ transform: 'translateY(100%)' }),
          animate('.3s ease-out', style({ transform: 'translateY(0%)' }))], {
            optional: true,
          }),
          query(':leave', [style({ transform: 'translateY(0%)' }), animate('.3s ease-out', style({ transform: 'translateY(-100%)' }))], {
            optional: true,
          }),
        ]),
      ];

    return trigger('openClose', [
        state('open', style({
          height: '*',
          opacity: 1,
        })),
        state('closed', style({
          height: '*',
          opacity: 1,
        })),
        //  transition('open => closed', left),
        //  transition('closed => open', right)
        // transition('open => closed', top),
        // transition('closed => open', bottom)
        transition('open => closed', [
            style({ opacity: 0 }),
            animate(300, style({ opacity: 1 }))
        ]),
        transition('closed => open', [
            style({ opacity: 0 }),
            animate(300, style({ opacity: 1 }))
        ])
      ])
}