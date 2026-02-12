import { NgModule, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger, query, group } from '@angular/animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";

import { FiltroParam, Parametros } from '../../../interfaces/parametros.interface';
import { forkJoin } from 'rxjs';
import { MenuSubServices } from '../../../services/menu.service';
import { FiltroMenu, FiltroSubmenu, Menu } from '../../../interfaces/menu.interface';
import { SubMenu } from '../../../interfaces/menu.interface';
import { UtilsGeneral } from '../../../shared/utils/utils-general';
import { NgxSpinnerService } from 'ngx-spinner';
import { PerfilServices } from '../../../services/perfil.service';
import { FiltroPerfil } from '../../../interfaces/rolxperfil.interface';
import { Perfil } from '../../../interfaces/rolxperfil.interface';
import { AsignacionDto, FiltroAsignacion } from 'app/interfaces/asignacion.interface';
import { AsignacionServices } from '../../../services/asignacion.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-asignaciones',
    //: module.id,
    templateUrl: './asignaciones.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [cardsAnimation()],
})

export class AsignacionesComponent implements OnInit{
    title: string;
    arrayData: AsignacionDto[] = [];
    filterArray: AsignacionDto[] = [];
    arrayDataMenu: (Menu | SubMenu)[] = [];
    arrayDataPerfil: Perfil[];
    arrayDataSubMenu: (Menu | SubMenu)[] = [];
    page: number = 1;
    pageSize: number = 10;
    totfilas: number = 0;
    filtrarTableForm: FormGroup;
    flagViewCards = true;
    flagEditView = false;
    data: AsignacionDto;
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


    constructor(private apiService: MenuSubServices,
        private apiServPerfil: PerfilServices,
        private apiServAsig: AsignacionServices,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private classGeneral: UtilsGeneral,
      private spinner : NgxSpinnerService)
        {
            this.title = "Asignaciones";
            this.titleForm = "Agregar";
        }

    ngOnInit(){
        this.textSpinner = "Cargando...";
        this.getMenuParam();
        this.validaUserLogin();
        this.cancelarRegistro();
        this.cargarInfoFiltro();
        this.getAll();
        this.filter();
        
    }

    //#region: Seccion para mostrar en el grip view
    async getAll(){
      this.spinner.show();
        try {
            this.filterArray = [];
            this.arrayData = [];

            var filtro: FiltroAsignacion = {
                combo: "N",
                estado: "1",
                input: "",
                menuId: "",
                perfilId: "",
                subMenuId: ""
            }
            var resp = await this.apiServAsig.getAll(filtro).toPromise();
            this.arrayData = resp?.data ?? [];
            this.filterArray = this.arrayData;
            this.totfilas = this.arrayData.length;

            this.spinner.hide();

        } catch (error) {
          this.spinner.hide();
            console.log(error);
        }
    }

    getMenuParam(){
    var filtroMenu: FiltroMenu = {
      combo: "S",
      tipo: "",
      input: ""
    }

    var filtroPerfil: FiltroPerfil = {
      combo: "S",
      input: ""
    }

    forkJoin({
            listMenu: this.apiService.getAll(filtroMenu, false),
            listPerfil: this.apiServPerfil.getAll(filtroPerfil)
          }).subscribe(({ listMenu, listPerfil }) => {
            this.arrayDataMenu = listMenu?.data ?? [];
            this.arrayDataPerfil = listPerfil?.data ?? [];
          });
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

    //#region: seccion editar perfil
    public  showForm(input: Parametros | null, action: string){
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
            var insertarData: AsignacionDto = {
                menuId : this.dataForm.controls['menu'].value,
                perfilId: this.dataForm.controls['perfil'].value,
                subMenuId: this.dataForm.controls['submenu'].value,
                usuarioCreacion : this.userName,
                estado: true
            }

            if(insertarData.menuId == 0 && insertarData.perfilId == 0 && insertarData.subMenuId == 0){
              this.classGeneral.showNotificationNotify(1,"top", "right", "Debe seleccionar los datos necesarios para asignar");
              return;
            }

            const itemMenu = this.arrayDataMenu.find(
                              x => (x as Menu).menuId == insertarData.menuId
                            ) as Menu | undefined;

            if(itemMenu.codTipo == "TS" && insertarData.subMenuId == 0){
              this.classGeneral.showNotificationNotify(1,"top", "right", "Menu seleccionado contiene submenu, por favor seleccione el submenu");
              return;
            }
    
            var resp = await this.apiServAsig.create(insertarData).toPromise()
            .then(res => {
                if(res && res["id"] == "999"){
                  this.classGeneral.showNotificationNotify(3,"top", "right", res["message"]);
                }
                else if(res && res["id"] != "0"){
                  this.classGeneral.showNotificationNotify(2,"top", "right", res["message"]);
                    this.ngOnInit();
                }
            })
            .catch((err) => {
              this.classGeneral.showNotificationNotify(4,"top", "right", "Error al registrar la información");
            });
            
        }
    
        async editRegistro(){
            var editData: AsignacionDto = {
                asignarId: this.data.asignarId,
                menuId: this.dataForm.controls['menu'].value,
                perfilId: this.dataForm.controls['perfil'].value,
                subMenuId: this.dataForm.controls['submenu'].value,
                usuarioCreacion : this.userName,
                usuarioModificacion : this.userName,
                estado: true
            }
    
            const itemMenu = this.arrayDataMenu.find(
                              x => (x as Menu).menuId == editData.menuId
                            ) as Menu | undefined;

            if(itemMenu.codTipo == "TS" && editData.subMenuId == 0){
              this.classGeneral.showNotificationNotify(3,"top", "right", "Debe seleccionar un submenu");
              return;
            }

            var resp = await this.apiServAsig.edit(editData,).toPromise()
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
                  menu: ['', [Validators.required]],
                  submenu: ['', [Validators.required]],
                  perfil: ['', [Validators.required]]
                });
        }
        else if (action == "edit"){
          this.titleForm = "Editar";
          this.dataForm = this.fb.group({
                  menu: ['', [Validators.required]],
                  submenu: ['', [Validators.required]],
                  perfil: ['', [Validators.required]]
                });
        }

        this.dataForm.controls["menu"].setValue("0");
        this.dataForm.controls["perfil"].setValue("0");
        this.dataForm.controls["submenu"].setValue("0");
        if (action == "edit"){
            this.asignarDatos();
          }
      }

      asignarDatos(){
        this.dataForm.controls["menu"].setValue(this.data.menuId);
        this.dataForm.controls["perfil"].setValue(this.data.perfilId);
        this.getSubMenu(this.data.menuId+"");
        this.dataForm.controls["submenu"].setValue(this.data.subMenuId);
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

  async getSubMenu(valor: string){
      this.spinner.show();
        try {

            var filtro: FiltroSubmenu = {
                combo: "S",
                input: "",
                tipo: "",
                menuId: valor
            }

            var resp = await this.apiService.getAll(filtro, true).toPromise();
            this.arrayDataSubMenu = resp?.data ?? []
           
            this.spinner.hide();

        } catch (error) {
          this.spinner.hide();
            console.log(error);
        }
    }

  onItemSelectEspecialidad(item: any) {
    console.log(item);
    if(item.target != undefined)
    {
      const value = (item.target as HTMLSelectElement).value;
      console.log('Menu seleccionada:', value);
      if(value === "0"){
        this.arrayDataSubMenu = [];
        return;
      }

      this.getSubMenu(value);
    }
  }
  eliminarAsignacion(id: number, usuarioModificacion: string) 
    {
       this.apiServAsig.delete(id, usuarioModificacion) .subscribe({ next: () => 
        {
           this.classGeneral.showNotificationNotify(2, "top", "right", `Asignación con ID ${id} eliminado correctamente`);//"success", );
           this.ngOnInit();
        },
         error: (err) => 
          { 
            this.classGeneral.showNotificationNotify(4, "top", "right", `Ocurrió un error al intentar eliminar la asignación`);//"eror", );
          } });
    }
  showModal(dto: AsignacionDto){
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
               this.eliminarAsignacion(parseInt(dto.asignarId), this.userName)
            }
          });
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