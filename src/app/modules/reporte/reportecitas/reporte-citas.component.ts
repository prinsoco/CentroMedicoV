import { Component, OnInit, ViewChild, ViewEncapsulation  } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { animate, state, style, transition, trigger, query, group } from '@angular/animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { FiltroMedico, Medico } from '../../../interfaces/medico.interface';
import { Especialidad, FiltroEspecialidad } from '../../../interfaces/especialidad.interface';
import { MedicoServices } from '../../../services/medico.service';
import { UtilsGeneral } from '../../../shared/utils/utils-general';
import { EspecialidadServices } from '../../../services/especialidad.service';
import { FiltroExcel } from '../../../interfaces/utils.interface';
import { forkJoin, of } from 'rxjs';
import { Cita, Citas, FiltroCitaAsig } from '../../../interfaces/citas.interface';
import { CitasServices } from '../../../services/citas.service';
import { Filtro } from 'app/interfaces/usuario.interface';


@Component({
    selector: 'app-reporte-citas',
    templateUrl: './reporte-citas.component.html',
    encapsulation: ViewEncapsulation.None,
        animations: [cardsAnimation()],
})

export class ReporteCitasComponent implements OnInit{
    title: string;
    arrayData: Cita[] = [];
    filterArray: Cita[] = [];
    arrayMedicos: Medico[] = [];
    totfilas: number;
    arrayEspecialidad: Especialidad[] = [];
    filtrarTableForm: FormGroup;
    textDescription = "activar"
    textSpinner = "Cargando...";
    page: number = 1;
    pageSize: number = 10;
    tipoPerfil?: string;
    userId?: number;
    user?: string;
    especialidad?:number;
    TipoReporte?:string;


    constructor(private apiService: CitasServices,
        private apiServMedico: MedicoServices,
        private apiServEspecialidad: EspecialidadServices,
        private classGeneral: UtilsGeneral,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
      private spinner : NgxSpinnerService)
        {
            this.title = "Citas";
        }

    ngOnInit(){
        this.textSpinner = "Cargando...";
        this.validaUserLogin();
        this.cargaInicial();
        this.getAll();
     
    }

    //#region: Seccion para mostrar en el grip view
    async getAll(especialidadId?: string, medicoId?: string){
      this.spinner.show();
        try {
            this.filterArray = [];
            this.arrayData = [];

            if( especialidadId== null || especialidadId== undefined)
            {
              especialidadId= this.tipoPerfil=="M"? this.especialidad +"":"0";
            }
            
            if(medicoId== null || medicoId == undefined)
            {
              medicoId= this.tipoPerfil=="M"? this.userId+"":"0";
            }
            
            var filtro:FiltroExcel = {
                
                especialidadId: especialidadId,     
                medicoId:medicoId,           
                reporte: "C",
                download: false,
                pacienteId: this.tipoPerfil=="P"? this.userId+"":"0"
                
            }
            var resp = await this.apiService.getAllDownload(filtro).toPromise();
            if(resp){
              console.log(resp);
              const citas: Citas[] = resp["data"] as Citas[];
              this.arrayData = citas ?? [];
              this.filterArray = this.arrayData;
              this.totfilas = this.arrayData.length;
              this.spinner.hide();
            }
        } catch (error) {
          this.spinner.hide();
            console.log(error);
        }
    }

    cargaInicial(){
      this.cargarInfoFiltros();
      this.cargarEspecialidad();

    }
    
    cargarEspecialidad(){
          
            var filtro: FiltroEspecialidad = {
                input: this.tipoPerfil=="M"?this.especialidad+"":"",
                combo: "S"
            }
      
            this.apiServEspecialidad.getAll(filtro).subscribe(r => {
              this.arrayEspecialidad = r?.data ?? []
              console.log(r);
              if(this.arrayEspecialidad.length == 0)
              {
                this.classGeneral.showNotificationNotify(3, "top","right", "No existen especialidades configuradas.");
              }
              else
              {
    
                if(this.tipoPerfil=="M")
                {
                    this.filtrarTableForm.controls["especialidad"].setValue( this.especialidad+"");
                    this.cargarMedicos(this.especialidad+"");
                    this.filtrarTableForm.controls["medico"].setValue( this.userId+"");
                    this.filtrarTableForm.get('especialidad')?.disable();
                    this.filtrarTableForm.get('medico')?.disable();
                }
                
              }
            });
    }

    onItemSelectEspecialidad(item: any) {
        console.log(item);
        if(item.target != undefined)
        {
          const value = (item.target as HTMLSelectElement).value;
          console.log('Especialidad seleccionada:', value);
          if(value === "0"){
            this.arrayMedicos = [];
            this.cargarInfoFiltros();
            return;
          }

          this.cargarMedicos(value);
        }
      }

      cargarMedicos(especialidadId: string){
          if(especialidadId != "0")
          {
            var filtroMed: FiltroMedico = {
                input: "",
                combo: "S",
                especialidadId: especialidadId === "-1" ? null : especialidadId
            }
      
            this.apiServMedico.getAll(filtroMed).subscribe(r => {
              this.arrayMedicos = r?.data ?? []
              console.log(r);
              if(this.arrayMedicos.length == 0)
              {
                this.classGeneral.showNotificationNotify(3, "top","right", "No existen médicos para la especialidad seleccionada.");
                //this.showNotification(3, "top","right", "No existen médicos para la especialidad seleccionada.");
              }
            });
          }
        }
    
   cargarDatosActualizar() {

    const especialidadId: string = this.filtrarTableForm.controls["especialidad"].value;
    const medicoId: string = this.filtrarTableForm.controls["medico"].value;
    
    this.getAll(especialidadId, medicoId);
  }

  cleanFilters(): void{
    this.filtrarTableForm.reset();
    this.filtrarTableForm.controls["especialidad"].setValue('0');
    this.filtrarTableForm.controls["medico"].setValue('0');
    this.arrayMedicos = [];
    this.cargaInicial();
    this.getAll();
  }

   cargarInfoFiltros(){
      this.filtrarTableForm = this.fb.group({
        especialidad: ['0'],
        medico: ['0']
        
    });

    this.filtrarTableForm.controls["especialidad"].setValue('0');
    this.filtrarTableForm.controls["medico"].setValue('0');
    
  }

    //#endregion: seccion editar perfil

    downloadFile(){
      if(this.filterArray != null && this.filterArray.length > 0){
        this.textSpinner = "Descargando";
        this.spinner.show();
        
        var filtro: FiltroExcel = {
          reporte: "C",
          medicoId: this.filtrarTableForm.controls["medico"].value,
          especialidadId: this.filtrarTableForm.controls["especialidad"].value,
          download: true
        }

        if(filtro.medicoId != "0" && filtro.especialidadId != "0"){
          filtro.descMedico = this.arrayMedicos.find(x => x.medicoId == parseInt(filtro.medicoId))?.nombres + ' ' + this.arrayMedicos.find(x => x.medicoId == parseInt(filtro.medicoId))?.apellidos;
          filtro.descEspecialidad = this.arrayEspecialidad.find(x => x.especialidadId == parseInt(filtro.especialidadId))?.descripcion;
        }
        else if(filtro.medicoId == "0" && filtro.especialidadId != "0"){
          this.classGeneral.showNotificationNotify(3, "top","right", "Debe seleccionar un médico");
          return;
        }

        this.apiService.getDownload(filtro).subscribe({
            next: (buffer) => {
              const data: Blob = new Blob([buffer], { type: 'application/pdf' });
              saveAs(data, "Citas.pdf");
              this.spinner.hide();
            },
            error: () => {
              this.spinner.hide();
              this.classGeneral.showNotificationNotify(
                4, "top", "right", "Error al generar el PDF"
              );
            }
          });
      }
      else{
        this.classGeneral.showNotificationNotify(3, "top","right", "No existen datos para descargar");
      }
    }
    validaUserLogin(){
    const login = this.classGeneral.validaUserLogin();
    if(login){
      this.tipoPerfil = login.loginPerfil;
      this.userId = login.loginId;
      this.user = login.loginUsuario;
      this.especialidad=login.loginEspecialidad;
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
