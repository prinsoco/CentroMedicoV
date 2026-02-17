import { NgModule, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ViewChild   } from '@angular/core';
import { animate, state, style, transition, trigger, query, group } from '@angular/animations';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin, Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { Cita } from '../../../../interfaces/citas.interface';
import { PacienteServices } from '../../../../services/paciente.service';
import { UtilsGeneral } from '../../../../shared/utils/utils-general';
import { Paciente } from '../../../../interfaces/paciente.interface';
import { CitasServices } from '../../../../services/citas.service';
import { HistorialServices } from '../../../../services/historial.service';
import { FiltroHistorial, HistorialClinico } from '../../../../interfaces/historial.interface';


@Component({
    selector: 'app-form-atencion',
    templateUrl: './atencion-citas.component.html',
    styleUrls: ['./atencion-citas.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class AtencionCitaComponent implements OnInit{
    @Input() breadcumb: string;
    @Input() action: string;
    @Input() data: Cita;

    @Output() flagViewCards = new EventEmitter<string>();
    @ViewChild(AtencionCitaComponent) table: AtencionCitaComponent | any;

    filtrarTableForm: FormGroup;
    titleForm: string;
    activeTab: number = 1;
    atenderCita: string = "";
    htmlContentDiagnostico: string;
    htmlContentReceta: string;
    dataPaciente: Paciente;
    dataArrayHistorial: HistorialClinico[] = [];
    arrayDataH: HistorialClinico[];
    totFilasHistorial: number;
    pacienteForm!: FormGroup;
    recetaForm!: FormGroup;
    page: number = 1;
    pageSize: number = 10;
    historialClinico: string = '';
    tipoPerfil?: string;
    userId?: number;
    user?: string;
    textSpinner = "Cargando...";
    historialCargado: boolean = false;
    historial$!: Observable<any[]>;
    tbody: string;

    constructor(private fb: FormBuilder,
      private apiSerPaciente: PacienteServices,
      private apiSerCita: CitasServices,
      private apiSerHistorial: HistorialServices,
      public classGeneral: UtilsGeneral,
      private spinner : NgxSpinnerService
    ) {
        
        }

    ngOnInit() {
      this.titleForm = "Paciente";
      //this.validaUserLogin();
      //this.validarEstadoCita();
      //this.generarHtmlReceta();
      //this.inicializarFormularios();
      this.getDatosIniciales();
    }

    ngAfterViewInit(){
      //this.getDatosIniciales();
      //this.tryInit();
      console.log('Historial:', this.dataArrayHistorial);
    }

    viewCards(){
        this.breadcumb="";
        this.flagViewCards.emit("cancel");
    }

    viewCardsReload(){
        this.breadcumb="";
        this.flagViewCards.emit("reload");
        this.ngOnInit();
    }

    inicializarFormularios(): void {
    this.pacienteForm = this.fb.group({
      nombres: [{ value: '', disabled: true}],
      apellidos: [{ value: '', disabled: true}],
      identificacion: [{ value: '', disabled: true}],
      email: [{ value: '', disabled: true}],
      edad: [{ value: '', disabled: true}],
      telefono: [{ value: '', disabled: true}],
      celular: [{ value: '', disabled: true}]
    });

    this.recetaForm = this.fb.group({
      medicamentos: ['', Validators.required],
      indicaciones: ['', Validators.required],
      diagnostico: ['', Validators.required],
      receta: ['', Validators.required]
    });

  }

  generarHtmlReceta(){
    this.htmlContentReceta = `
      <table style="font-family: arial, sans-serif;border-collapse: collapse;width: 100%;">
        <tr>
          <th style="border: 1px solid #ddd;padding: 8px;width: 50%;">Medicamentos</th>
          <th style="border: 1px solid #ddd;padding: 8px;width: 50%;">Instructivo</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd;padding: 8px;background-color: #ddd;"></br></td>
          <td style="border: 1px solid #ddd;padding: 8px;background-color: #ddd;"></br></td>
        </tr>
      </table>
      `;
  }

  asignarPaciente(){
    if(this.dataPaciente){
      this.pacienteForm.controls["nombres"].setValue(this.dataPaciente.nombres);
      this.pacienteForm.controls["apellidos"].setValue(this.dataPaciente.apellidos);
      this.pacienteForm.controls["identificacion"].setValue(this.dataPaciente.identificacion);
      this.pacienteForm.controls["email"].setValue(this.dataPaciente.email);
      this.pacienteForm.controls["edad"].setValue(this.dataPaciente.edad);
      this.pacienteForm.controls["telefono"].setValue(this.dataPaciente.telefono);
      this.pacienteForm.controls["celular"].setValue(this.dataPaciente.celular);
    }
  }

  cambiarTab(tab: number): void {
    this.activeTab = tab;
  }

  guardarReceta(): void {
    if (this.recetaForm.invalid) {
      this.recetaForm.markAllAsTouched();
      return;
    }

    console.log('Receta guardada:', this.recetaForm.value);
  }

  validarEstadoCita(){
    this.atenderCita = this.data.estadoCita;
  }

  async actualizarEstadoCita(estado: string){
    this.data.estadoCita = estado;
    this.data.usuarioModificacion = this.user;

    var resp = await this.apiSerCita.edit(this.data).toPromise()
    .then(res => {
        if(res["id"]+"" === "0"){
          this.classGeneral.showNotificationNotify(2, "top", "right", "Se genera la atención de la cita");
          if(estado === "PROC"){
            this.atenderCita = estado
          }
          else{
            this.atenderCita = estado
          }
        }
    })
    .catch((err) => {
        this.classGeneral.showNotificationNotify(4, "top", "right", "Error al actualizar el estado de al cita");
    });
  }

  generarHistorialClinico(){
    this.spinner.show();
    var newHistorial: HistorialClinico = {
        citaId: this.data.citaId,
        medicoId: this.data.medicoId,
        pacienteId: this.data.pacienteId,
        diagnostico: this.htmlContentDiagnostico,
        receta: this.htmlContentReceta,
        estado: true,
        usuarioCreacion: this.user
    }

      var resp = this.apiSerHistorial.create(newHistorial).toPromise()
          .then(res => {
              var codigo = parseInt(res["id"]+"");
              this.spinner.hide();
              if(codigo > 0){
                this.classGeneral.showNotificationNotify(2, "top", "right", res["message"]+"");
              }
              else{
                this.classGeneral.showNotificationNotify(3, "top", "right", res["message"]+"");
              }
          })
          .catch((err) => {
            this.spinner.hide();
              this.classGeneral.showNotificationNotify(4, "top", "right", "Error al crear el historial clínico");
          });
  }

  actualizarDataFlujo(estado: string){
    if(estado === "PROC"){
      this.actualizarEstadoCita(estado);
    }
    else{
      this.actualizarEstadoCita(estado);
      this.generarHistorialClinico();
    }
  }

  getHistorialClinico(){
    this.spinner.show();
    this.historialCargado = false;

    var filtros: FiltroHistorial = {
        citaId: "0",
        medicoId: this.data.medicoId+"",
        pacienteId: this.data.pacienteId+""
    }

    this.apiSerHistorial.getAll(filtros).subscribe({
      next: (res) => {
        this.spinner.hide();

              this.dataArrayHistorial = res.data ?? [];
              this.arrayDataH = this.dataArrayHistorial;
              this.totFilasHistorial = this.arrayDataH.length;
              this.generarHtmlHistorial();
              this.historialCargado = true;

      },
      error: err => {
        console.error(err);
        this.historialCargado = true;
      }
    });
  }

  async cargarDatosPaciente() {
    this.spinner.show();
    var resp = await this.apiSerPaciente.getById(this.data?.pacienteId ?? 0).toPromise()
    .then(res => {
        this.dataPaciente = res?.data ?? null;

        this.spinner.hide();
        if(!this.dataPaciente){
          this.classGeneral.showNotificationNotify(1, "top", "right", "No existe el paciente");
          return;
        }

        this.asignarPaciente();
    })
    .catch((err) => {
      this.spinner.hide();
        this.classGeneral.showNotificationNotify(4, "top", "right", "Error al consultar el paciente");
    });
  }

  getDatosIniciales(){
    this.spinner.show();
    var filtros: FiltroHistorial = {
        citaId: this.data.citaId+"",
        medicoId: this.data.medicoId+"",
        pacienteId: this.data.pacienteId+""
    }

    forkJoin({
      configUL: of(this.validaUserLogin()),
      configEC: of(this.validarEstadoCita()),
      configGHR: of(this.generarHtmlReceta()),
      configIF: of(this.inicializarFormularios()),
      configHC: of(this.getHistorialClinico()),
      paciente: this.apiSerPaciente.getById(this.data?.pacienteId ?? 0)//,
     // historialClinico: this.apiSerHistorial.getAll(filtros)
    }).subscribe(({ paciente, configUL, configHC, configGHR, configEC, configIF }) => {
      this.dataPaciente = paciente?.data ?? null;

      //se cierra el cargando
      this.spinner.hide();

      //cargando datos
      if(!this.dataPaciente){
          this.classGeneral.showNotificationNotify(1, "top", "right", "No existe el paciente");
          return;
        }

        this.asignarPaciente();
    });
  }

  validaUserLogin(){
    const login = this.classGeneral.validaUserLogin();
    if(login){
      this.tipoPerfil = login.loginPerfil;
      this.userId = login.loginId;
      this.user = login.loginUsuario;
    }
  }

  mostrarCaracteres(texto: string): string{
    return this.classGeneral.recortarTexto(texto , 200);
  }

  regresaFechaLocal(fechaCita: string): string{
    const fecha = new Date(fechaCita);
    return this.classGeneral.fechaLocal(fechaCita);
  }

  puedeNavegar(tab: number): boolean {
    if(tab == 2 || tab == 3)
    {
      if(this.atenderCita == 'ASIG')
      {
        return false;
      }
    }
    
    return true;
  }

  generarHtmlHistorial() {
   
    if (this.dataArrayHistorial) {
      for (let index = 0; index < this.dataArrayHistorial.length; index++) {
        let td: string;
        let tr: string = '<tr>{0}</tr>';
        td = "<td>" + this.dataArrayHistorial[index].historialId+"" + "</td>" +
        "<td>" + this.mostrarCaracteres(this.dataArrayHistorial[index].descHistorial) + "</td>" +
        "<td>" + this.regresaFechaLocal(this.dataArrayHistorial[index].fechaCreacion+"") + "</td>"+
        "<td class='text-right'><button class='btn btn-success btn-icon btn-sm ' rel='tooltip' type='button' data-original-title='' title='Ver Historial'><i class='fa fa-edit'></i></button></td>";
        this.tbody = tr.replace("{0}",td);
      }
    }
  }

  validarlogId(id: number): number{
    console.log(id);

    return id;
  }

   validarlogFecha(fecha: Date): Date{
    console.log(fecha);

    return fecha;
  }

  generarTitulo(dto: HistorialClinico){
      return this.classGeneral.fechaLocal(dto.fechaCreacion, true) + ": " + dto.especialidad + " - " + dto.medico
  }

  abrirModal(dto: HistorialClinico){
    const htmlContenido = `
    <div class="timeline-panel" style="text-align:left">
      <div class="timeline-heading">
        <span class="badge badge-success" style="font-size:14px">
          ${dto.especialidad} - ${dto.medico}
        </span>
      </div>

      <div class="timeline-body" style="margin-top:10px">
        <p><strong>Diagnóstico:</strong> ${dto.diagnostico}</p>
        <p><strong>Receta:</strong> ${dto.receta ?? 'N/A'}</p>
      </div>

      <hr />

    </div>
  `;

    Swal.fire({
        title: '📋 Visualizar Historial',
        html: htmlContenido,   // 👈 AQUÍ VA EL HTML
        icon: 'info',
        width: '950px',
        scrollbarPadding: true,
        showCancelButton: false,
        confirmButtonText: 'Cerrar',
        reverseButtons: true,
        focusConfirm: false
      });
  }

}