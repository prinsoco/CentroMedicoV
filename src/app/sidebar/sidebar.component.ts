import { Component, OnInit, AfterViewInit, AfterViewChecked, AfterContentInit } from '@angular/core';
import { MenuSubServices } from '../services/menu.service';
import { UtilsGeneral } from '../shared/utils/utils-general';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

//Metadata
export interface RouteInfo {
    path: string;
    title: string;
    type: string;
    collapse?: string;
    icontype: string;
    // icon: string;
    children?: ChildrenItems[];
}

export interface ChildrenItems {
    path: string;
    title: string;
    ab: string;
    type?: string;
}

//Menu Items
export const ROUTES: RouteInfo[] = [{
        path: '/dashboard',
        title: 'Dashboard',
        type: 'link',
        icontype: 'nc-icon nc-bank'
    },{
        path: '/components',
        title: 'Components',
        type: 'sub',
        collapse: 'components',
        icontype: 'nc-icon nc-layout-11',
        children: [
            {path: 'buttons', title: 'Buttons', ab:'B'},
            {path: 'grid', title: 'Grid System', ab:'GS'},
            {path: 'panels', title: 'Panels', ab:'P'},
            {path: 'sweet-alert', title: 'Sweet Alert', ab:'SA'},
            {path: 'notifications', title: 'Notifications', ab:'N'},
            {path: 'icons', title: 'Icons', ab:'I'},
            {path: 'typography', title: 'Typography', ab:'T'}
        ]
    },{
        path: '/forms',
        title: 'Forms',
        type: 'sub',
        collapse: 'forms',
        icontype: 'nc-icon nc-ruler-pencil',
        children: [
            {path: 'regular', title: 'Regular Forms', ab:'RF'},
            {path: 'extended', title: 'Extended Forms', ab:'EF'},
            {path: 'validation', title: 'Validation Forms', ab:'VF'},
            {path: 'wizard', title: 'Wizard', ab:'W'}
        ]
    },{
        path: '/tables',
        title: 'Tables',
        type: 'sub',
        collapse: 'tables',
        icontype: 'nc-icon nc-single-copy-04',
        children: [
            {path: 'regular', title: 'Regular Tables', ab:'RT'},
            {path: 'extended', title: 'Extended Tables', ab:'ET'},
            {path: 'datatables.net', title: 'Datatables.net', ab:'DT'}
        ]
    },{
        path: '/maps',
        title: 'Maps',
        type: 'sub',
        collapse: 'maps',
        icontype: 'nc-icon nc-pin-3',
        children: [
            {path: 'google', title: 'Google Maps', ab:'GM'},
            {path: 'fullscreen', title: 'Full Screen Map', ab:'FSM'},
            {path: 'vector', title: 'Vector Map', ab:'VM'}
        ]
    },{
        path: '/widgets',
        title: 'Widgets',
        type: 'link',
        icontype: 'nc-icon nc-box'

    },{
        path: '/charts',
        title: 'Charts',
        type: 'link',
        icontype: 'nc-icon nc-chart-bar-32'

    },{
        path: '/calendar',
        title: 'Calendar',
        type: 'link',
        icontype: 'nc-icon nc-calendar-60'
    },{
        path: '/pages',
        title: 'Pages',
        collapse: 'pages',
        type: 'sub',
        icontype: 'nc-icon nc-book-bookmark',
        children: [
            {path: 'timeline', title: 'Timeline Page', ab:'T'},
            {path: 'user', title: 'User Page', ab:'UP'},
            {path: 'login', title: 'Login Page', ab:'LP'},
            {path: 'register', title: 'Register Page', ab:'RP'},
            {path: 'lock', title: 'Lock Screen Page', ab:'LSP'}
        ]
    },
    { path: '/pacientes',         title: 'Pacientes',    type: 'link', icontype:'nc-badge' },
    { path: '/especialidades',       title: 'Especialidades',  type: 'link', icontype:'nc-sound-wave', },
    { path: '/perfiles',       title: 'Perfiles',  type: 'link', icontype:'nc-settings-gear-65' },
    { path: '/roles',       title: 'Roles',  type: 'link', icontype:'nc-settings-gear-65' },
    { path: '/usuarios',       title: 'Usuarios',  type: 'link', icontype:'nc-circle-10' },
    { path: '/medicos',       title: 'Médicos',  type: 'link', icontype:'nc-ambulance' },
    { path: '/parametros',       title: 'Parámetros',  type: 'link', icontype:'nc-tile-56' },
    { path: '/notificaciones',       title: 'Plantillas',  type: 'link', icontype:'nc-paper' },
    { path: '/agendamiento',       title: 'Agendamiento',  type: 'link', icontype:'nc-paper' },
    { path: '/citas',       title: 'Citas',  type: 'link', icontype:'nc-paper' },
    { path: '/menu',       title: 'Menú',  type: 'link', icontype:'nc-paper' },
    { path: '/submenu',       title: 'SubMenú',  type: 'link', icontype:'nc-paper' }
];

@Component({
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent {
    public menuItems: any[];
    userName?: string;
    perfilId?: string;

    constructor(private apiService: MenuSubServices,
            private classGeneral: UtilsGeneral, private router: Router) {
            {

            }
    
        }

    isNotMobileMenu(){
        if( window.outerWidth > 991){
            return false;
        }
        return true;
    }

    ngOnInit() {
        this.validaUserLogin();
        this.getAllFront();
        //this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
    ngAfterViewInit(){
    }

    getAllFront(){
        forkJoin({
                    listFront: this.apiService.getAllFront(this.perfilId)
                  }).subscribe(({ listFront }) => {
                    this.menuItems = listFront?.data ?? [];
                  });
    }

    validaUserLogin(){
        const usuario = localStorage.getItem('loginUsuario');
        const perfil = localStorage.getItem('loginPerfil');
        const perfilId = localStorage.getItem('loginPerfilId');
        const time = localStorage.getItem('time');

        if(usuario && perfil){
            this.userName = usuario;
            this.perfilId = perfilId;
            console.log("Time: " + time);
            this.validarSesionLogin(time, perfil);
        }
        else{
          this.router.navigate(["/user/login"]);
        }
      }

      validarSesionLogin(date?: string, perfil?: string): void {
        if (date){
          const fecha = this.parseCustomDate(date);
          if (fecha < new Date()) {
            localStorage.clear();
            console.log("Time convertido: " + fecha);
            console.log("Fecha del sistema: " + new Date());
            if(perfil && perfil === "P"){
                this.router.navigate(["/user/login"]);
            }
            else{
              this.router.navigate(["/admin/login"]);
            }
          }
        }
      }

      cerrarSesion(){
        const usuario = localStorage.getItem('loginUsuario');
        const perfil = localStorage.getItem('loginPerfil');
        localStorage.clear();
        if(perfil && perfil === "P"){
                this.router.navigate(["/user/login"]);
            }
            else{
              this.router.navigate(["/admin/login"]);
            }
        
      }

      parseCustomDate(dateStr: string): Date | null {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute, second);
      }
}
