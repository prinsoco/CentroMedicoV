import { Component, OnInit, ViewChild, ViewEncapsulation  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger, query, group } from '@angular/animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';

import { Filtro, FiltroMedico, Medico } from '../../interfaces/medico.interface';
import { MedicoServices } from '../../services/medico.service';
import { UtilsGeneral } from '../../shared/utils/utils-general';

declare interface TableData {
    headerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'app-medicos',
    //moduleId: module.id,
    templateUrl: './list-medico.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [cardsAnimation()],
})

export class MedicosComponent implements OnInit{
    title: string;
    arrayData: Medico[];
    filterArray: Medico[] | null = null;
    page: number = 1;
    pageSize: number = 10;
    totfilas: number = 0;
    filtrarTableForm: FormGroup;
    flagViewCards = true;
    flagEditView = false;
    data: Medico;
    textDescription = "activar"
    textSpinner = "Cargando..."
    action=""
    disabled = false;
    breadcumb= "";
    tipoPerfil?: string;
    userId?: number;

    constructor(private apiService: MedicoServices,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private classGeneral: UtilsGeneral)
        {
            this.title = "Médicos";
        }

    ngOnInit(){
        this.textSpinner = "Cargando...";
        this.validaUserLogin();
        this.cargarInfoFiltro();
        this.getAll();
        this.filter();
    }

    //#region: Seccion para mostrar en el grip view
    async getAll(){
        try {
            this.filterArray = [];
            this.arrayData = [];

            var filtro: FiltroMedico = {
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
    public  showForm(input: Medico | null, action: string){
        this.data = input;
        this.textSpinner = "Procesando...";
        switch (action) {
          case 'add':
              this.breadcumb="Médico > Agregar";
              break;
          case 'view':
              this.breadcumb="Médico > Ver";
              break;
          case 'edit':
              this.breadcumb="Médico > Editar";
              break;
          default:
              break;
        }

        this.action = action;
        this.flagViewCards = false;
        this.flagEditView = true; 
    }

    viewCards(action:string){
        this.breadcumb="";
        if(action=="cancel"){
          this.flagViewCards = true;
          this.flagEditView = false;
        }
        if(action=="reload"){
          this.textSpinner = "Cargando...";
          this.getAll();
          setTimeout(() => {
            this.flagViewCards = true;
            this.flagEditView = false;
          }, 1000);
  
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
      }
      else{
        console.log("sin datos");
      }
    }
    //#endregion: seccion editar perfil
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