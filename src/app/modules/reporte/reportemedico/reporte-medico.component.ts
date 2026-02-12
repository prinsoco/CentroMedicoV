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

@Component({
    selector: 'app-reporte-medicos',
    templateUrl: './reporte-medico.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [cardsAnimation()],
})

export class ReporteMedicoComponent implements OnInit{
    title: string;
        arrayData: Medico[] = [];
        filterArray: Medico[] = [];
        totfilas: number;
        arrayEspecialidad: Especialidad[] = [];
        filtrarTableForm: FormGroup;
        textDescription = "activar"
        textSpinner = "Cargando...";
        page: number = 1;
        pageSize: number = 10;
    
        constructor(private apiServMedico: MedicoServices,
            private apiServEspecialidad: EspecialidadServices,
            private classGeneral: UtilsGeneral,
            private fb: FormBuilder,
            private router: Router,
            private route: ActivatedRoute,
          private spinner : NgxSpinnerService)
            {
                this.title = "Médicos";
            }
    
        ngOnInit(){
            this.textSpinner = "Cargando...";
            this.cargaInicial();
            this.getAll();
        }
    
        //#region: Seccion para mostrar en el grip view
        async getAll(especialidadId?: string){
          this.spinner.show();
            try {
                this.filterArray = [];
                this.arrayData = [];
    
                var filtro: FiltroExcel = {
                    especialidadId: especialidadId ?? "0",
                    medicoId: "0",
                    reporte: "M",
                    download: false
                }
                var resp = await this.apiServMedico.getAllDownload(filtro).toPromise();
                if(resp){
                  console.log(resp);
                  const medicos: Medico[] = resp["data"] as Medico[];
                  this.arrayData = medicos ?? [];
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
                    input: "",
                    combo: "S"
                }
          
                this.apiServEspecialidad.getAll(filtro).subscribe(r => {
                  this.arrayEspecialidad = r?.data ?? []
                  console.log(r);
                  if(this.arrayEspecialidad.length == 0)
                  {
                    this.classGeneral.showNotificationNotify(3, "top","right", "No existen especialidades configuradas.");
                  }
                });
        }
        
       cargarDatosActualizar() {
    
        const especialidadId: string = this.filtrarTableForm.controls["especialidad"].value;
    
        this.getAll(especialidadId);
      }
  
      cleanFilters(): void{
        this.textSpinner = "Cargando..."
        this.filtrarTableForm.reset();
        this.filtrarTableForm.controls["especialidad"].setValue('0');
        this.cargaInicial();
        this.getAll();
      }
    
       cargarInfoFiltros(){
          this.filtrarTableForm = this.fb.group({
            especialidad: ['0']
        });
    
        this.filtrarTableForm.controls['especialidad'].setValue("0");
      }
    
        //#endregion: seccion editar perfil
    
        downloadFile(){
          if(this.filterArray != null && this.filterArray.length > 0){
            this.textSpinner = "Descargando";
            this.spinner.show();
            
            var filtro: FiltroExcel = {
              reporte: "M",
              medicoId: "0",
              especialidadId: this.filtrarTableForm.controls["especialidad"].value,
              download: true
            }
    
            if(filtro.especialidadId != "0"){
              filtro.descEspecialidad = this.arrayEspecialidad.find(x => x.especialidadId == parseInt(filtro.especialidadId))?.descripcion;
            }
    
            this.apiServMedico.getDownload(filtro).subscribe({
                next: (buffer) => {
                  const data: Blob = new Blob([buffer], { type: 'application/pdf' });
                  saveAs(data, "Medicos.pdf");
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
    