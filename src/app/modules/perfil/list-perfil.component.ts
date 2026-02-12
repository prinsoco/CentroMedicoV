import { NgModule, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger, query, group } from '@angular/animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";

import { Filtro, FiltroPerfil, Perfil } from '../../interfaces/rolxperfil.interface';
import { PerfilServices } from '../../services/perfil.service';
import { UtilsGeneral } from '../../shared/utils/utils-general';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-perfil',
    //moduleId: module.id,
    templateUrl: './list-perfil.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [cardsAnimation()],
})

export class PerfilesComponent implements OnInit{
    title: string;
    arrayData: Perfil[];
    filterArray: Perfil[] | null = null;
    page: number = 1;
    pageSize: number = 10;
    totfilas: number = 0;
    filtrarTableForm: FormGroup;
    flagViewCards = true;
    flagEditView = false;
    data: Perfil;
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



    constructor(private apiService: PerfilServices,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private classGeneral: UtilsGeneral)
        {
            this.title = "Perfiles";
            this.titleForm = "Agregar";
        }

    ngOnInit(){
        this.textSpinner = "Cargando...";

        this.cancelarRegistro();
        this.cargarInfoFiltro();
        this.getAll();
        this.validaUserLogin();
        this.filter();
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

    //#region: Seccion para mostrar en el grip view
    async getAll(){
        try {
            this.filterArray = [];
            this.arrayData = [];

            var filtro: FiltroPerfil = {
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
    public  showForm(input: Perfil | null, action: string){
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
            var insertarData: Perfil = {
                perfilId : 0,
                descripcion : this.dataForm.controls['descripcion'].value,
                codigo : this.dataForm.controls['codigo'].value,
                usuarioCreacion : "admin",
                estado: true
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
    eliminarPerfil(id: number, usuarioModificacion: string) 
        {
           this.apiService.delete(id, usuarioModificacion) .subscribe({ next: () => 
            {
               this.classGeneral.showNotificationNotify(2, "top", "right", `Perfil con ID ${id} eliminado correctamente`);//"success", );
               this.ngOnInit();
            },
             error: (err) => 
              { 
                this.classGeneral.showNotificationNotify(4, "top", "right", `Ocurrió un error al intentar eliminar el Perfil`);//"eror", );
              } });
        }
      showModal(dto: Perfil){
             Swal.fire({
                title: 'Confirmación eliminación asignación',
                text: '¿Está seguro que desea eliminar la asignación?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
              }).then(result => {
                if (result.isConfirmed) {
                   this.eliminarPerfil(dto.perfilId, this.userName)
                }
              });
          }
    

        async editRegistro(){
            var editData: Perfil = {
                perfilId: this.data.perfilId,
                descripcion : this.dataForm.controls['descripcion'].value,
                codigo : this.dataForm.controls['codigo'].value,
                usuarioCreacion : "admin",
                usuarioModificacion : "admin",
                estado: true
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
                    codigo: ['', [Validators.required]]
                });
        }
        else if (action == "edit"){
          this.titleForm = "Editar";
          this.dataForm = this.fb.group({
                    descripcion: [this.data.descripcion, [Validators.required]],
                    codigo: [this.data.codigo, [Validators.required]]
                });
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