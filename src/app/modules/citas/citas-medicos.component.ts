import { NgModule, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NumberSymbol } from '@angular/common';
import { ToastrService } from "ngx-toastr";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Doctor, Filtro, FiltroMedico, Medico } from '../../interfaces/medico.interface';
import { CitasServices } from '../../services/citas.service';
import { CitasMedico, Feriados, Horarios, HorariosMedico, HorasLaborales, InfoModal } from '../../interfaces/citas.interface';
import { ModalCitasComponent } from '../citas/modal-citas-medico.component';
import { EspecialidadServices } from '../../services/especialidad.service';
import { Especialidad, FiltroEspecialidad } from '../../interfaces/especialidad.interface';
import { MedicoServices } from '../../services/medico.service';
import { PacienteServices } from '../../services/paciente.service';
import { FiltroPaciente, Paciente } from '../../interfaces/paciente.interface';
import { ParametroServices } from '../../services/parametros.service';
import { FiltroParam, Parametros } from '../../interfaces/parametros.interface';
import { UtilsGeneral } from '../../shared/utils/utils-general';

@Component({
  selector: 'app-calendario',
  templateUrl: './citas-medicos.component.html',
  styleUrls: ['./citas-medicos.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CalendarioComponent implements OnInit {
  @ViewChild('modalAsignarCita') modalAsignarCita!: NgbModal;

  anios?: string = "";
  render?: string = "Renderizar";
  renderValor?: number = 0;
  tipoCalendet?: string = "Calender";
  doctores: Doctor[] = [];
  feriados: string[] = [];
  meses: string[] = [];
  horarios: Horarios[] = [];
  citas: any[] = [];
  horariosMedico: HorariosMedico[] = [];
  horarioCalender: HorariosMedico[] = [];
  horarioDia: HorariosMedico[] = [];
  calendarOptions!: CalendarOptions;
  dataReady = false;
  viewReady = false;
  especialidades: Especialidad[] = [];
  medicos: Medico[] = [];
  pacientes: Paciente[];
  pacienteSeleccionados: Paciente[] = [];
  filtrarTableForm: FormGroup;
  mostrarPaciente: boolean = false;
  pacienteLogin: string = "";
  dropdownSettingsMultiplePaciente = {};
  closeDropdownSelection = false;
  listParam: Parametros[] = [];
  dataInfoCitasHorario: InfoModal;
  controles: boolean;
  disabledPaciente?: boolean;
  tipoPerfil?: string;
  userId?: number;
  user?: string;
  

  constructor(private apiServices: CitasServices,
    private apiServEsp: EspecialidadServices,
    private apiServMed: MedicoServices,
    private apiServPaciente: PacienteServices,
    private apiServParam: ParametroServices,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private classGeneral: UtilsGeneral
  ) {

  }

  ngOnInit(): void {
    this.validaUserLogin();
    this.cargaInicial();
    //this.generarHorarios(0,0);   
  }

  ngAfterViewInit(): void{
    this.viewReady = true;
    this.tryInit();
  }

  cargaInicial(){
    this.getParametros();
    this.cargarSettingsDropwdown();
    this.cargarInfoFiltros();
    this.pacienteSeleccionados = [];
    this.cargarPacientes();
    this.cargarDatos(this.tipoPerfil === "M" ? this.userId+"" : "0","0", this.tipoPerfil === "P" ? this.userId+"" : "0", true);
    this.configurarCalendarioInitial();
  }

  cargaPostModal(){
    this.cargarInfoFiltros();
    this.cargarDatos(this.tipoPerfil === "M" ? this.userId+"" : "0","0", this.tipoPerfil === "P" ? this.userId+"" : "0", true);
    this.configurarCalendarioInitial();
    this.cargarSettingsDropwdown();
    this.pacienteSeleccionados = [];
  }

  cargarInfoFiltros(){
      this.filtrarTableForm = this.fb.group({
        especialidad: ['0'],
        medico: ['0'],
        paciente: ['0'],
        pacienteInfo: [{ value: '', disabled: false}]
    });

    this.filtrarTableForm.controls['especialidad'].setValue("0");
    this.filtrarTableForm.controls['medico'].setValue("0");
    this.filtrarTableForm.controls['paciente'].setValue("0");
  }

  cleanFilters(): void{
    this.dataReady = false;
    this.filtrarTableForm.reset();
    this.filtrarTableForm.controls["especialidad"].setValue('0');
    this.filtrarTableForm.controls["medico"].setValue('0');
    this.filtrarTableForm.controls["paciente"].setValue('0');
    this.filtrarTableForm.controls["pacienteInfo"].setValue('');
    this.pacienteSeleccionados = [];
    this.medicos = [];
    this.cargaInicial();
  }

  cargarSettingsDropwdown(){
    this.dropdownSettingsMultiplePaciente = {
         singleSelection: true,
         idField: 'pacienteId',
         textField: 'pacienteInfo',
         searchPlaceholderText : 'Buscar',
         unSelectAllText: 'UnSelect All',
         allowSearchFilter: true,
         closeDropDownOnSelection: this.closeDropdownSelection
         };
   }

  cargarDatos(medicoId: string, especialidadId: string, pacienteId: string, inicial: boolean) {
    var filtroEsp: FiltroEspecialidad = {
        input: "",
        combo: "S"
    }

    if(inicial)
    {
      forkJoin({
        listEspecialidad: this.apiServEsp.getAll(filtroEsp),
        feriado: this.apiServices.getAllFeriados(this.anios),
        horarioMedico: this.apiServices.getAllHorario(medicoId === "0" ? "0" : medicoId, "0", pacienteId === "0" ? "0" : pacienteId, null)
      }).subscribe(({ listEspecialidad,feriado, horarioMedico }) => {
        this.feriados = this.classGeneral.generarListFeriados(feriado.data);
        this.horariosMedico = horarioMedico?.data;
        this.especialidades = listEspecialidad?.data ?? [];
        this.dataReady = true;
        this.tryInit();
      });
    }
    else
    {
      this.generarHorarios(medicoId, especialidadId, pacienteId);
    }
  }

  cargarDatosActualizar() {
    this.dataReady = false;

    const especialidadId: string = this.filtrarTableForm.controls["especialidad"].value;
    const medicoId: string = this.filtrarTableForm.controls["medico"].value;
    console.log(this.pacienteSeleccionados);
    let pacienteId: string = "";
    
    this.pacienteSeleccionados.forEach(x => {
      pacienteId = x.pacienteId?.toString()
    });

    this.cargarDatos(this.tipoPerfil === "M" ? this.userId+"" : medicoId, especialidadId, this.tipoPerfil === "P" ? this.userId+"" : pacienteId, false);
  }

  onItemSelectEspecialidad(item: any) {
    console.log(item);
    if(item.target != undefined)
    {
      const value = (item.target as HTMLSelectElement).value;
      console.log('Especialidad seleccionada:', value);
      if(value === "0"){
        this.medicos = [];
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

      this.apiServMed.getAll(filtroMed).subscribe(r => {
        this.medicos = r?.data ?? []
        console.log(r);
        if(this.medicos.length == 0)
        {
          this.classGeneral.showNotificationNotify(3, "top","right", "No existen médicos para la especialidad seleccionada.");
          //this.showNotification(3, "top","right", "No existen médicos para la especialidad seleccionada.");
        }
      });
    }
  }

  cargarPacientes(){
    var filtroPac: FiltroPaciente = {
        input: "",
        combo: "S"
    }

    this.apiServPaciente.getAll(filtroPac).subscribe(r => {
      this.pacientes = r?.data ?? []
      console.log(r);
    });
  }

  asignarPacienteLogin(){
    this.disabledPaciente = false;
    this.filtrarTableForm.get('especialidad')?.enable();
    this.filtrarTableForm.get('medico')?.enable();

    if(this.tipoPerfil === "P"){
      let pacienteLogin = this.pacientes.filter(r => r.pacienteId === this.userId);
        this.pacienteSeleccionados.push(pacienteLogin[0]);
        this.disabledPaciente = true;
    }
    else if (this.tipoPerfil === "M"){
        this.filtrarTableForm.get('especialidad')?.disable();
        this.filtrarTableForm.get('medico')?.disable();
    }
  }

  tryInit() {
    if (this.dataReady && this.viewReady) {
      this.renderCalendar();
      this.asignarPacienteLogin();
    }
  }

  renderCalendar() {
    console.log('Datos y vista listos', this.horarios);
    this.configurarCalendarioDato();
  }

  async generarHorarios(medicoId: string, especialidadId: string, pacienteId: string){
  
    this.apiServices.getAllHorario(medicoId, especialidadId, pacienteId, null).subscribe(response => {
      this.horariosMedico = response?.data ?? [];
      console.log(this.horariosMedico);
       this.dataReady = true;
      this.tryInit();
    }, err => {
      console.error(err);
    });
  }

  async getParametros(){
    var filtroEsp: FiltroParam = {
        input: "",
        combo: "S",
        tipo: this.tipoCalendet,
        codigo: this.render
    }
    
    this.apiServParam.getAll(filtroEsp).subscribe(response => {
      this.listParam = response?.data ?? [];
      console.log(this.listParam);

      this.listParam.forEach(x => {
        this.renderValor = parseInt(x.valor ?? "0");
      });

    }, err => {
      console.error(err);
    });
  }

   /*configurarCalendarioDato() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
      initialView: 'dayGridWeek',
      locale: 'es',
      height: '500px',

      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: '' // user can switch between the two
      },

      allDaySlot: false,
      displayEventTime: false,

      events: this.generarEventos(),

      eventClick: (info) => {
        const doctorId = info.event.extendedProps['doctorId'];
        const fecha = info.event.startStr;
        this.abrirModal(doctorId, fecha);
      },
      dayCellDidMount: (arg) => {
        this.bloquearCalender(arg);
      },
      eventContent: this.renderDoctorEvent.bind(this)
    };
  } */
 configurarCalendarioDato() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
      initialView: 'dayGridWeek',
      locale: 'es',
      height: '500px',

      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: '' // user can switch between the two
      },

      allDaySlot: false,
      displayEventTime: false,

      events: this.generarEventos(),
      dayCellDidMount: (arg) => {
        this.bloquearCalender(arg);
      },
      eventContent: this.renderDoctorEvent.bind(this),
      eventClick: (info) => {
        const doctorId = info.event.extendedProps['doctorId'];
        const fecha = info.event.startStr;
        const especialidadId = info.event.extendedProps['especialidadId'];
        const especialidad = info.event.extendedProps['especialidad'];
        const horario = info.event.extendedProps['horario'];
        const fechaIni = info.event.extendedProps['fechaInicio'];
        const fechaFin = info.event.extendedProps['fechaFin'];
        const nombre = info.event.title;

        this.abrirModal(doctorId, fecha, especialidadId, especialidad, nombre, horario, fechaIni, fechaFin);
      }
    };
  } 

  configurarCalendarioInitial() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
      initialView: 'dayGridWeek',
      locale: 'es',
      height: '500px',

      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: '' // user can switch between the two
      },

      allDaySlot: false,
      displayEventTime: false
    };
  }

  generarEventos(): any[] {
    const eventos: any[] = [];
    const hoy = new Date();
    let anio = hoy.getFullYear();
    let mes = hoy.getMonth();

    for (let cont = 1; cont <= this.renderValor; cont++) {

        anio = mes === 12 ? anio + 1 : anio;
        mes = mes === 12 ? 1 : mes + 1;

      const diasMes = new Date(anio, mes, 0).getDate();

      console.log("anio: " + anio);
      console.log("mes: " + mes);
      console.log("diasMes: " + diasMes);

      for (let d = 1; d <= diasMes; d++) {
        const fecha = new Date(anio, mes - 1, d);
        const diaSemana = fecha.getDay()+"";

        console.log("fecha: " + fecha);
        console.log("diaSemana: " + diaSemana);
        const fechaStr = this.classGeneral.fechaLocal(fecha);

        this.horarioCalender = this.horariosMedico.filter(doc =>
          this.classGeneral.fechaLocal(doc.fechaInicioLaboral) === fechaStr
        );

        console.log(this.horarioCalender);
        if (this.horarioCalender.length > 0) {
          this.horarioDia = this.horarioCalender.filter(doc =>
            doc.diasAtencion.includes(diaSemana)
          );

          console.log(this.horarioDia);
          if (this.horarioDia.length > 0) {
            console.log("push");
            for (const doc of this.horarioDia)
            {
              let citasTotal: number = 0;
              let feriado: Boolean = false;
                if(doc.citas != undefined){
                  const citasDia = doc.citas.filter(c =>
                    c.medicoId === doc.medicoId &&
                    this.classGeneral.fechaLocal(c.fechaCita) === fechaStr
                  );

                  citasTotal = citasDia.length;
                }

                if (this.feriados.includes(fechaStr)) {
                  feriado = true;
                }

                eventos.push({
                  title: doc.nombre,
                  start: fecha,
                  allDay: true,
                  extendedProps: {
                    doctorId: doc.medicoId,
                    especialidad: doc.especialidad,
                    especialidadId: doc.especialidadId,
                    foto: doc.foto,
                    horario: doc.horarioTexto,
                    totalCitas: citasTotal,
                    fechaCalendario: fecha,
                    fechaInicio: doc.fechaInicioLaboral,
                    fechaFin: doc.fechaFinalLaboral,
                    diaSemana: diaSemana,
                    feriado: feriado
                  }
                });

                if(feriado)
                {
                  break;
                }
            }
          }
        }
      }
    }
    return eventos;
  }

  /*generarEventos(): any[] {
    const eventos: any[] = [];
    const hoy = new Date();
    let anio = hoy.getFullYear();
    let mes = hoy.getMonth();

    for (let cont = 1; cont <= this.renderValor; cont++) {

        anio = mes === 12 ? anio + 1 : anio;
        mes = mes === 12 ? 1 : mes + 1;

      const diasMes = new Date(anio, mes, 0).getDate();

      console.log("anio: " + anio);
      console.log("mes: " + mes);
      console.log("diasMes: " + diasMes);

      for (let d = 1; d <= diasMes; d++) {
        const fecha = new Date(anio, mes - 1, d);
        const diaSemana = fecha.getDay()+"";

        console.log("fecha: " + fecha);
        console.log("diaSemana: " + diaSemana);

        this.horariosMedico.forEach(doc => {
          console.log("doc: " + doc);
          if(this.fechaLocal(doc.fechaInicioLaboral) === this.fechaLocal(fecha))
          {
            if (doc.diasAtencion.includes(diaSemana)) {
              const citasDia = this.citas.filter(c =>
                c.doctorId === doc.medicoId &&
                c.fecha === fecha.toISOString().substring(0, 10)
              );

              eventos.push({
                title: doc.nombre,
                start: fecha,
                allDay: true,
                extendedProps: {
                  doctorId: doc.medicoId,
                  especialidad: doc.especialidad,
                  foto: doc.foto,
                  horario: doc.horarioTexto,
                  totalCitas: citasDia.length,
                  fechaCalendario: fecha,
                  diaSemana: diaSemana,
                  horarioLaboral: doc.horarioLaboral
                }
              });
            }
          }
        });
        //este no va
        this.doctores.forEach(doc => {
          if (doc.diasAtencion.includes(diaSemana)) {
            const citasDia = this.citas.filter(c =>
              c.doctorId === doc.id &&
              c.fecha === fecha.toISOString().substring(0, 10)
            );

            eventos.push({
              title: doc.nombre,
              start: fecha,
              allDay: true,
              extendedProps: {
                doctorId: doc.id,
                especialidad: doc.especialidad,
                foto: doc.foto,
                horario: doc.horarioTexto,
                totalCitas: citasDia.length
              }
            });
          }
        });
      }
    }
    return eventos;
  }*/

 /* eventosPorDia() {
  const eventos: any[] = [];

  this.diasCalendario.forEach(fecha => {
    this.doctores.forEach(doc => {
      if (this.doctorAtiendeEseDia(doc, fecha)) {
        const citasDia = this.obtenerCitas(doc.id, fecha);

        eventos.push({
          title: doc.nombre,
          start: fecha,
          allDay: true,
          extendedProps: {
            doctorId: doc.id,
            especialidad: doc.especialidad,
            foto: doc.foto,
            horario: doc.horarioTexto,
            totalCitas: citasDia.length
          }
        });
      }
    });
  });

  return eventos;
}*/

  /*renderDoctorEvent(arg: any) {
    const { foto, especialidad, horario, totalCitas, fechaCalendario } = arg.event.extendedProps;

    return {
      html: `
        <div class="doctor-card">
          <img src="${foto}" style="width: 45px;" />
          <div class="info">
            <strong>${arg.event.title}</strong>
            <small>${especialidad}</small>
            <small>${horario}</small>
            <span class="badge">${totalCitas} citas</span>
          </div>
        </div>
      `
    };
  }*/
 renderDoctorEvent(arg: any) {
    const { foto, especialidad, horario, totalCitas, fechaCalendario, feriado, doctorId, especialidadId } = arg.event.extendedProps;

    if(feriado)
    {
      this.bloquearSemanaVisible();
      return {
        html: `
          <div class="doctor-card">
            <!-- Línea 2 -->
            <div class="linea-2">DIA NO LABORABLE</div>
          </div>
        `
      };
    }
    else{
      //
      var argInfo: InfoModal = {
          descEspecialidad: especialidad,
          nombres: arg.event.title,
          horario: horario,
          medicoId: doctorId,
          especialidadId: especialidadId
      }

      return {
        html: `
          <div class="doctor-card" style="background-color: #2857A1 !important;">
          <!-- Línea 1 -->
          <div class="linea-1">
            <img src="${foto}" class="doctor-img">
            <div class="doctor-info">
              <strong>${arg.event.title}</strong>
              <small>${especialidad}</small>
            </div>
          </div>

          <!-- Línea 2 -->
          <div class="linea-2">
            ${horario}
          </div>

          <!-- Línea 3 -->
          <div class="linea-3">
            <span class="badge">${totalCitas} citas</span>
            <button class="btn btn-primary btn-round btn-icon-add add-cita" style="padding: 0.5rem 0rem !important;"><i class="nc-icon nc-simple-add"></i></button>
          </div>
        </div>
        `
      };
    }
  }

  bloquearCalender(arg: any)
  {
    const fecha = arg.date.toISOString().substring(0, 10);
    if (this.feriados.includes(fecha)) {
      //const styleDay = arg.el.classList.value?.split(' ');
      //styleDay.forEach(r => arg.el.classList.replace(r.trim(), ''));
      //for (let index = 0; index < styleDay.length; index++) {
        //const element = styleDay[index];
        //arg.el.classList.remove(element);
      //}
      //arg.el.classList.replace(styleDay, 'fc-dia-feriado');
      arg.el.classList.add('fc-dia-feriado');
    }
  }

  bloquearSemanaVisible() {
    const celdas = document.querySelectorAll('.fc-daygrid-day');

    celdas.forEach((celda: any) => {
      const fecha = celda.getAttribute('data-date');
      if (!fecha) return;

      if (this.feriados.includes(fecha)) {
        celda.classList.add('fc-dia-feriado');
      } else {
        celda.classList.remove('fc-dia-feriado');
      }
    });
  }

  mostrarHorarioCita(){
    console.log("listo");
    /*this.dataInfoCitasHorario = infoMedico;

    this.modalService.open(this.modalEstadoCampana, {
        windowClass : "myCustomModalClassSupervisores",
        centered: true,
        backdrop: 'static',
        beforeDismiss: () => {
            
            return true;
    }
    });
*/
     // this.spinner.hide();
  }

  abrirModal(doctorId: number, fecha: string, especialidadId: number, especialidad: string, nombres: string, horario: string, fechaInicio: string, fechaFin: string) {
    console.log("abrirModal");
    console.log(doctorId);
    console.log(fecha);

    var infoMedico: InfoModal = {
        descEspecialidad: especialidad,
        especialidadId: especialidadId,
        medicoId: doctorId,
        nombres: nombres,
        horario: horario,
        fechaDia: fecha,
        pacienteId: this.pacienteSeleccionados[0].pacienteId,
        paciente: this.pacienteSeleccionados[0].nombres + ' ' + this.pacienteSeleccionados[0].apellidos +';'+ this.pacienteSeleccionados[0].email
    }

    this.dataInfoCitasHorario = infoMedico;

    // 🔹 Quita foco del elemento que estaba activo
    const active = document.activeElement as HTMLElement;
    if (active) {
      active.blur();
    }
    
    this.modalService.open(this.modalAsignarCita, {
        windowClass : "myCustomModalClassSupervisores",
        centered: true,
        backdrop: 'static',
        keyboard: false,
        container: 'body',
        beforeDismiss: () => {
                this.cargaPostModal();
                return true;
        }
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
}
