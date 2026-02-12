import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { UsuariosComponent } from './usuarios/list-usuarios.component';
import { PacientesComponent } from './paciente/list-pacientes.component';
import { MedicosComponent } from './medico/list-medico.component';
import { CitasAsignadasComponent } from './citas/consulta/citas-asignadas.component';
import { CalendarioComponent } from './citas/citas-medicos.component';
import { NotificacionesComponent } from './notificaciones/list-notificaciones.component';
import { ParametrosComponent } from './configuracion/list-parametros.component';
import { RolesComponent } from './rol/list-rol.component';
import { PerfilesComponent } from './perfil/list-perfil.component';
import { EspecialidadesComponent } from './especialidad/list-especialidades.component';
import { MenuComponent } from './menu/list-menu.component';
import { SubMenuComponent } from './submenu/list-submenu.component';
import { ReporteCitasComponent } from './reporte/reportecitas/reporte-citas.component';
import { ReportePacienteComponent } from './reporte/reportepaciente/reporte-pacientes.component';
import { ReporteMedicoComponent } from './reporte/reportemedico/reporte-medico.component';
import { AsignacionesComponent } from './menu/asignaciones/asignaciones.component';
import { AtencionCitaComponent } from './citas/consulta/atencion/atencion-citas.component';

export const ModulesRoutes: Routes = [{
    path: 'modulo_config',
    children: [{
        path: 'menu',          
        component: MenuComponent
    },{
        path: 'submenu',          
        component: SubMenuComponent
    },{
        path: 'especialidades',
        component: EspecialidadesComponent
    },{
        path: 'perfiles',
        component: PerfilesComponent
    },{
        path: 'roles',
        component: RolesComponent
    },{
        path: 'parametros',
        component: ParametrosComponent
    },{
        path: 'asignaciones',
        component: AsignacionesComponent
    }]
},{
    path: 'modulo_paciente',
    children: [{
        path: 'pacientes',
        component: PacientesComponent
    }]
},{
    path: 'modulo_medico',
    children: [{
        path: 'medicos',
        component: MedicosComponent
    }]
},{
    path: 'modulo_notif',
    children: [{
        path: 'notificaciones',
        component: NotificacionesComponent
    }]
},{
    path: 'modulo_citas',
    children: [{
        path: 'agendamiento',
        component: CalendarioComponent
    },{
        path: 'citas',          
        component: CitasAsignadasComponent
    },{
        path: 'citasasignadas',          
        component: CitasAsignadasComponent
    }]
},{
    path: 'modulo_admin',
    children: [{
        path: 'usuarios',
        component: UsuariosComponent
    }]
},{
    path: 'modulo_repo',
    children: [{
        path: 'reportecitas',
        component: ReporteCitasComponent
    },{
        path: 'reportepacientes',
        component: ReportePacienteComponent
    },{
        path: 'reportemedico',
        component: ReporteMedicoComponent
    }]
}];
/*
export const ModulesRoutes: Routes = [
    {
        path: '',
        children: [{
            path: 'pacientes',
            component: PacientesComponent
        }]
    },{
        path: '',
        children: [{
            path: 'especialidades',
            component: EspecialidadesComponent
        }]
    },{
        path: '',
        children: [{
            path: 'perfiles',
            component: PerfilesComponent
        }]
    },{
        path: '',
        children: [{
            path: 'roles',
            component: RolesComponent
        }]
    },{
        path: '',
        children: [{
            path: 'usuarios',
            component: UsuariosComponent
        }]
    },{
        path: '',
        children: [{
            path: 'medicos',
            component: MedicosComponent
        }]
    },{
        path: '',
        children: [{
            path: 'parametros',
            component: ParametrosComponent
        }]
    },{
        path: '',
        children: [{
            path: 'notificaciones',
            component: NotificacionesComponent
        }]
    },{
        path: '',
        children: [{
            path: 'agendamiento',
            component: CalendarioComponent
        }]
    },{
        path: '',
        children: [{
            path: 'citas',          
            component: CitasAsignadasComponent
        }]
    },{
        path: '',
        children: [{
            path: 'menu',          
            component: MenuComponent
        }]
    },{
        path: '',
        children: [{
            path: 'submenu',          
            component: SubMenuComponent
        }]
    }
];*/

@NgModule({
    imports: [RouterModule.forChild(ModulesRoutes)],
    exports: [RouterModule]
  })
  export class ModulesRoutingModule { }