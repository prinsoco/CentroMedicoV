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
import { FiltroMenu, Menu } from '../../interfaces/menu.interface';
import { SubMenu } from '../../interfaces/menu.interface';
import { UtilsGeneral } from '../../shared/utils/utils-general';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-menu',
    //: module.id,
    templateUrl: './list-menu.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [cardsAnimation()],
})

export class MenuComponent implements OnInit{
    title: string;
    arrayData: (Menu | SubMenu)[] = [];
    filterArray: (Menu | SubMenu)[] = [];
    arrayDataParam: Parametros[];
    arrayDataMenu: Catalogo[];
    page: number = 1;
    pageSize: number = 10;
    totfilas: number = 0;
    filtrarTableForm: FormGroup;
    flagViewCards = true;
    flagEditView = false;
    data: Menu;
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

            var filtro: FiltroMenu = {
                input: "",
                combo: "N",
            }
            var resp = await this.apiService.getAll(filtro, false).toPromise();
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
            var insertarData: Menu = {
                menuId : 0,
                codMenu: this.dataForm.controls['menu'].value,
                codTipo: this.dataForm.controls['type'].value,
                collapse: this.dataForm.controls['collapse'].value,
                iconTipo: this.dataForm.controls['icontype'].value,
                path: this.dataForm.controls['path'].value,
                usuarioCreacion : this.userName,
                estado: true
            }
    
            var resp = await this.apiService.create(insertarData, false).toPromise()
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
              //this.classGeneral.showNotificationNotify(4,"top", "right", "Error al registrar la información");
                //this.showNotification(4, "top","right", "Error al registrar la información");
            });
            
        }
     eliminarMenu(id: number, usuarioModificacion: string) 
        {
           this.apiService.delete(id, usuarioModificacion) .subscribe({ next: () => 
            {
               this.classGeneral.showNotificationNotify(2, "top", "right", `Menú con ID ${id} eliminado correctamente`);//"success", );
               this.ngOnInit();
            },
             error: (err) => 
              { 
                this.classGeneral.showNotificationNotify(4, "top", "right", `Ocurrió un error al intentar eliminar el menú`);//"eror", );
              } });
        }
      showModal(dto: Menu){
             Swal.fire({
                title: 'Confirmación eliminación Menú',
                text: '¿Está seguro que desea eliminar el menú?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
              }).then(result => {
                if (result.isConfirmed) {
                   this.eliminarMenu (parseInt(dto.menuId +""), this.userName)
                }
              });
          }
        async editRegistro(){
            var editData: Menu = {
                menuId: this.data.menuId,
                codMenu: this.dataForm.controls['menu'].value,
                codTipo: this.dataForm.controls['type'].value,
                collapse: this.dataForm.controls['collapse'].value,
                iconTipo: this.dataForm.controls['icontype'].value,
                path: this.dataForm.controls['path'].value,
                usuarioCreacion : this.userName,
                usuarioModificacion : this.userName,
                estado: true
            }
    
            var resp = await this.apiService.edit(editData, false).toPromise()
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
                  path: ['', [Validators.required]],
                  collapse: ['', [Validators.required]],
                  icontype: ['', [Validators.required]],
                    type: ['', [Validators.required]]
                });
        }
        else if (action == "edit"){
          this.titleForm = "Editar";
          this.dataForm = this.fb.group({
                  menu: ['', [Validators.required]],
                  path: ['', [Validators.required]],
                  collapse: ['', [Validators.required]],
                  icontype: ['', [Validators.required]],
                    type: ['', [Validators.required]]
                });
        }

        this.dataForm.controls["menu"].setValue("0");
        this.dataForm.controls["type"].setValue("0");
        if (action == "edit"){
            this.asignarDatos();
          }
      }

      asignarDatos(){
        this.dataForm.controls["menu"].setValue(this.data.codMenu);
        this.dataForm.controls["collapse"].setValue(this.data.collapse);
        this.dataForm.controls["path"].setValue(this.data.path);
        this.dataForm.controls["icontype"].setValue(this.data.iconTipo);
        this.dataForm.controls["type"].setValue(this.data.codTipo);
      }

  showNotification(color: number, from, align, mensaje: string) {

    switch (color) {
      case 1:
        this.toastr.info(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + mensaje + '</span>',
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-info alert-with-icon",
            positionClass: "toast-" + from + "-" + align
          }
        );
        break;
      case 2:
        this.toastr.success(
          '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + mensaje + '</span>',
          "",
          {
            timeOut: 40000000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-success alert-with-icon",
            positionClass: "toast-" + from + "-" + align
          }
        );
        break;
      case 3:
        this.toastr.warning(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + mensaje + '</span>',
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-warning alert-with-icon",
            positionClass: "toast-" + from + "-" + align
          }
        );
        break;
      case 4:
        this.toastr.error(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + mensaje + '</span>',
          "",
          {
            timeOut: 4000,
            enableHtml: true,
            closeButton: true,
            toastClass: "alert alert-danger alert-with-icon",
            positionClass: "toast-" + from + "-" + align
          }
        );
        break;
      case 5:
        this.toastr.show(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + mensaje + '</span>',
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-primary alert-with-icon",
            positionClass: "toast-" + from + "-" + align
          }
        );
        break;
      default:
        break;
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

  getMenuParam(){
    var filtroParam: FiltroParam = {
      combo: "S",
      tipo: "TipoMenu"
    }

    var filtroCat: FiltroCat = {
      tipo: "MODULOS",
      combo: "S",
      estado: "S"
    }

    forkJoin({
            listParamTipo: this.apiservParam.getAll(filtroParam),
            listCatalogo: this.apiservCat.getAll(filtroCat)
          }).subscribe(({ listParamTipo, listCatalogo }) => {
            this.arrayDataParam = listParamTipo?.data ?? [];
            this.arrayDataMenu = listCatalogo?.data ?? [];
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