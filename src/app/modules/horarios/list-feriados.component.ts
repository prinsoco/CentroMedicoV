import { NgModule, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger, query, group } from '@angular/animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";

import { FiltroFeriado, Feriado } from '../../interfaces/feriadohorarios.interface';
import { UtilsGeneral } from '../../shared/utils/utils-general';
import Swal from 'sweetalert2';
import { FeriadoHorariosServices } from '../../services/feriadohorarios.service';

@Component({
    selector: 'app-feriados',
    templateUrl: './list-feriados.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [cardsAnimation()],
})

export class FeriadosComponent implements OnInit{
    title: string;
    arrayData: Feriado[];
    filterArray: Feriado[] | null = null;
    page: number = 1;
    pageSize: number = 10;
    totfilas: number = 0;
    filtrarTableForm: FormGroup;
    flagViewCards = true;
    flagEditView = false;
    data: Feriado;
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



    constructor(private apiService: FeriadoHorariosServices,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private classGeneral: UtilsGeneral)
        {
            this.title = "Feriados";
            this.titleForm = "Agregar";
        }

    ngOnInit(){
        this.textSpinner = "Cargando...";
        this.validaUserLogin();
        
        if(this.tipoPerfil == "A"){
          this.cancelarRegistro();
          this.cargarInfoFiltro();
          this.getAll();
          this.filter();
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

    //#region: Seccion para mostrar en el grip view
    async getAll(){
        try {
            this.filterArray = [];
            this.arrayData = [];

            var filtro: FiltroFeriado = {
                anio: ""
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
    public  showForm(input: Feriado | null, action: string){
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
      const fecha = this.dataForm.controls['fecha'].value;
      if(fecha){
      const newFecha = new Date(fecha);
      const dia = newFecha.getDate();
      const mes = newFecha.getMonth() + 1; // ⚠️ Los meses empiezan en 0
      const anio = newFecha.getFullYear();

      console.log(dia, mes, anio);

            var insertarData: Feriado = {
                feriadoId : 0,
                descripcion : this.dataForm.controls['descripcion'].value,
                anio : anio,
                mes: mes,
                dia: dia,
                usuarioCreacion : this.userName,
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
      }

    eliminarFeriado(id: number) 
        {
           this.apiService.delete(id) .subscribe({ next: () => 
            {
               this.classGeneral.showNotificationNotify(2, "top", "right", `Feriado con ID ${id} eliminado correctamente`);//"success", );
               this.ngOnInit();
            },
             error: (err) => 
              { 
                this.classGeneral.showNotificationNotify(4, "top", "right", `Ocurrió un error al intentar eliminar el feriado`);//"eror", );
              } });
        }

      showModal(dto: Feriado){
             Swal.fire({
                title: 'Confirmación de eliminación',
                text: '¿Está seguro que desea eliminar el feriado configurado?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
              }).then(result => {
                if (result.isConfirmed) {
                   this.eliminarFeriado(dto.feriadoId)
                }
              });
          }
    

        async editRegistro(){
          const fecha = this.dataForm.controls['fecha'].value;
          if(fecha){
            const newFecha = new Date(fecha);
          const dia = newFecha.getDate();
          const mes = newFecha.getMonth() + 1; // ⚠️ Los meses empiezan en 0
          const anio = newFecha.getFullYear();

          console.log(dia, mes, anio);
            var editData: Feriado = {
                feriadoId: this.data.feriadoId,
                descripcion : this.dataForm.controls['descripcion'].value,
                anio : anio,
                mes: mes,
                dia: dia,
                usuarioCreacion : this.userName,
                usuarioModificacion : this.userName,
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
                    fecha: ['', [Validators.required]]
                });
        }
        else if (action == "edit"){
          this.titleForm = "Editar";
          const fechaString = `${this.data.anio}-${this.data.mes.toString().padStart(2,'0')}-${this.data.dia.toString().padStart(2,'0')}`;
          //const newFecha = new Date(fechaString);

          this.dataForm = this.fb.group({
                    descripcion: [this.data.descripcion, [Validators.required]],
                    fecha: [fechaString, [Validators.required]]
                });
        }
      }

      fechaFeriado(dto: Feriado): string{
        if(dto){
          return `${dto.anio}-${dto.mes.toString().padStart(2,'0')}-${dto.dia.toString().padStart(2,'0')}`;
        }else{
          return "";
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