
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { LoginAdminComponent } from './administrativo/login-admin.component';
import { NgxSpinnerModule } from "ngx-spinner";
import { RegistroComponent } from './registro/registro.component';
import { InfoRegistroComponent } from './informativo/inforegistro.component';
import { recuperacionComponent } from './recuperacion/recuperacion.component';
import { RecuperacionAdminComponent } from './recuperacion/recuperacionadmin.component';
import { ClaveAdminComponent } from './clave/claveadmin.component';
import { ClaveComponent } from './clave/clave.component';

const routes: Routes = [
  { path: 'user/login', component: LoginComponent, title: 'Login'  },
  { path: 'admin/login', component: LoginAdminComponent, title: 'LoginAdmin'  },
  { path: 'pages/registro', component: RegistroComponent, title: 'Registro'  },
  { path: '/inforegistro', component: InfoRegistroComponent, title: 'Registro Exitoso'  },
  { path: 'pages/recuperacion', component: recuperacionComponent, title: 'Recuperación Exitosa'  },
  { path: 'pages/recuperacionadmin', component: RecuperacionAdminComponent, title: 'Recuperación Exitosa'  },
  { path: 'claveadmin', component: ClaveAdminComponent, title: 'Recuperación Exitosa'  },
  { path: 'claveuser', component: ClaveComponent, title: 'Recuperación Exitosa'  }
];

@NgModule({
  declarations: [LoginComponent, LoginAdminComponent, RegistroComponent, InfoRegistroComponent,recuperacionComponent, RecuperacionAdminComponent, ClaveAdminComponent, ClaveComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgxSpinnerModule
  ]
})
export class LoginModule {}
