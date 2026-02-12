import { NgModule, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger, query, group } from '@angular/animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";

import { FiltroParam, Parametros } from '../../interfaces/parametros.interface';
import { ParametroServices } from '../../services/parametros.service';
import { CatalogoServices } from '../../services/catalogo.service';
import { forkJoin } from 'rxjs';
import { Catalogo, FiltroCat } from '../../interfaces/catalogo.interface';
import { MenuSubServices } from '../../services/menu.service';
import { FiltroSubmenu, Menu, SubMenu } from '../../interfaces/menu.interface';
import { UtilsGeneral } from '../../shared/utils/utils-general';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-submenu',
    //: module.id,
    templateUrl: './list-submenu.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [cardsAnimation()],
})

export class SubMenuComponent implements OnInit{
    title: string;
    arrayData: (Menu | SubMenu)[] = [];
    filterArray: (Menu | SubMenu)[] = [];
    arrayDataParam: Parametros[] = [];
    arrayDataMenu: Menu[] = [];
    page: number = 1;
    pageSize: number = 10;
    totfilas: number = 0;
    filtrarTableForm: FormGroup;
    flagViewCards = true;
    flagEditView = false;
    data: SubMenu;
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
        private apiservParam: ParametroServices,
        private apiservCat: CatalogoServices,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private classGeneral: UtilsGeneral)
        {
            this.title = "Parámetros";
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
        try {
            this.filterArray = [];
            this.arrayData = [];

            var filtro: FiltroParam = {
                input: "",
                combo: "S"
            }
            var resp = await this.apiService.getAll(filtro, true).toPromise();
            this.arrayData = resp?.data ?? [];
            this.filterArray = this.arrayData;
            this.totfilas = this.arrayData.length;

        } catch (error) {
            console.log(error);
        }
    }

    getMenuParam(){
    var filtroParam: FiltroParam = {
      combo: "S",
      tipo: "TipoMenu"
    }

    var filtroCat: FiltroSubmenu = {
      combo: "S",
      input: "",
      tipo: "TS"
    }

    forkJoin({
            listParamTipo: this.apiservParam.getAll(filtroParam),
            listMenu: this.apiService.getAll(filtroCat, false)
          }).subscribe(({ listParamTipo, listMenu }) => {
            this.arrayDataParam = listParamTipo?.data ?? [];
            this.arrayDataMenu = listMenu?.data ?? [];
          });
  }

  async createRegistro(){
            var insertarData: SubMenu = {
                subMenuId: 0,
                menuId : this.dataForm.controls['menu'].value,
                descSubMenu: this.dataForm.controls['title'].value,
                path: this.dataForm.controls['path'].value,
                abreviatura: this.dataForm.controls['abreviatura'].value,
                usuarioCreacion : this.userName,
                estado: true
            }
    
            var resp = await this.apiService.create(insertarData, true).toPromise()
            .then(res => {
                if(res && res["id"] != "0"){
                    this.classGeneral.showNotificationNotify(2,"top", "right", res["message"]);
                    //this.showNotification(2, "top", "right", res["message"]);
                    this.ngOnInit();
                }
            })
            .catch((err) => {
              this.classGeneral.showNotificationNotify(4,"top", "right", "Error al registrar la información");
                //this.showNotification(4, "top","right", "Error al registrar la información");
            });
            
        }
        eliminarSubmenu(id: number, usuarioModificacion: string) 
            {
               this.apiService.deleteSubMenu(id, usuarioModificacion) .subscribe({ next: () => 
                {
                   this.classGeneral.showNotificationNotify(2, "top", "right", `Submenú con ID ${id} eliminado correctamente`);//"success", );
                   this.ngOnInit();
                },
                 error: (err) => 
                  { 
                    this.classGeneral.showNotificationNotify(4, "top", "right", `Ocurrió un error al intentar eliminar el submenú`);//"eror", );
                  } });
            }
          showModal(dto:SubMenu){
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
                       this.eliminarSubmenu(dto.subMenuId, this.userName)
                    }
                  });
              }
    
        async editRegistro(){
            var editData: SubMenu = {
              subMenuId: this.data.subMenuId,
                menuId: this.data.menuId,
                descSubMenu: this.dataForm.controls['title'].value,
                path: this.dataForm.controls['path'].value,
                abreviatura: this.dataForm.controls['abreviatura'].value,
                usuarioCreacion : this.userName,
                usuarioModificacion : this.userName,
                estado: true
            }
    
            var resp = await this.apiService.edit(editData, true).toPromise()
            .then(res => {
                if(res && res["id"] != "0"){
                  this.classGeneral.showNotificationNotify(2, "top", "right", res["message"]);
                    //this.showNotification(2, "top", "right", res["message"]);
                    this.ngOnInit();
                }
            })
            .catch((err) => {
              this.classGeneral.showNotificationNotify(4, "top", "right", "Error al editar el registro");
                //this.showNotification(4, "top", "right", "Error al editar el registro");
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
                    title: ['', [Validators.required]],
                    path: ['', [Validators.required]],
                    abreviatura: ['', [Validators.required]]
                  });
          }
          else if (action == "edit"){
            this.titleForm = "Editar";
            this.dataForm = this.fb.group({
                    menu: ['', [Validators.required]],
                    title: ['', [Validators.required]],
                    path: ['', [Validators.required]],
                    abreviatura: ['', [Validators.required]]
                  });
          }

          this.dataForm.controls["menu"].setValue("0");
          if (action == "edit"){
            this.asignarDatos();
          }
      }

      asignarDatos(){
        this.dataForm.controls["menu"].setValue(this.data.menuId);
        this.dataForm.controls["title"].setValue(this.data.descSubMenu);
        this.dataForm.controls["path"].setValue(this.data.path);
        this.dataForm.controls["abreviatura"].setValue(this.data.abreviatura);
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