import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { ModulesRoutes, ModulesRoutingModule } from './modules.routing';
import { NotifierModule, NotifierService } from 'angular-notifier';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CKEditorModule } from 'ng2-ckeditor';
import { NgxSpinnerModule } from "ngx-spinner";
import { FullCalendarModule } from "@fullcalendar/angular";
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularEditorModule } from '@grantmk/angular-editor';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { HttpClientModule } from '@angular/common/http';
import { UsuariosComponent } from './usuarios/list-usuarios.component';
import { FormUsuarioComponent } from './usuarios/form-usuarios/form-usuarios.component';
import { PacientesComponent } from './paciente/list-pacientes.component';
import { FormPacienteComponent } from './paciente/form-paciente/form-paciente.component';
import { MedicosComponent } from './medico/list-medico.component';
import { FormMedicoComponent } from './medico/form-medico/form-medico.component';
import { ModalCitasComponent } from './citas/modal-citas-medico.component';
import { CalendarioComponent } from './citas/citas-medicos.component';
import { CitasAsignadasComponent } from './citas/consulta/citas-asignadas.component';
import { AtencionCitaComponent } from './citas/consulta/atencion/atencion-citas.component';
import { EspecialidadesComponent } from './especialidad/list-especialidades.component';
import { PerfilesComponent } from './perfil/list-perfil.component';
import { RolesComponent } from './rol/list-rol.component';
import { ParametrosComponent } from './configuracion/list-parametros.component';
import { NotificacionesComponent } from './notificaciones/list-notificaciones.component';
import { FormNotificacionComponent } from './notificaciones/form-notificacion/form-notificacion.component';
import { MenuComponent } from './menu/list-menu.component';
import { SubMenuComponent } from './submenu/list-submenu.component';
import { ReporteCitasComponent } from './reporte/reportecitas/reporte-citas.component';
import { ReporteMedicoComponent } from './reporte/reportemedico/reporte-medico.component';
import { ReportePacienteComponent } from './reporte/reportepaciente/reporte-pacientes.component';
import { AsignacionesComponent } from './menu/asignaciones/asignaciones.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        CKEditorModule,
        FullCalendarModule,
        NgSelectModule,
        NgMultiSelectDropDownModule,
        NotifierModule,
        NgbModalModule,
        AngularEditorModule,
        NgxSpinnerModule,
        ModulesRoutingModule,
        HttpClientModule
    ],
    providers: [
        NotifierService
    ],
    declarations: [
        PacientesComponent,
        FormPacienteComponent,
        EspecialidadesComponent,
        PerfilesComponent,
        RolesComponent,
        UsuariosComponent,
        FormUsuarioComponent,
        MedicosComponent,
        FormMedicoComponent,
        ParametrosComponent,
        NotificacionesComponent,
        FormNotificacionComponent,
        CalendarioComponent,
        ModalCitasComponent,
        CitasAsignadasComponent,
        AtencionCitaComponent,
        MenuComponent,
        SubMenuComponent,
        ReporteCitasComponent,
        ReporteMedicoComponent,
        ReportePacienteComponent,
        AsignacionesComponent
    ]
})

export class ModulesModule {}