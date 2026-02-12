
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { LoginAdminComponent } from './administrativo/login-admin.component';
import { NgxSpinnerModule } from "ngx-spinner";
import { RegistroComponent } from './registro/registro.component';
import { InfoRegistroComponent } from './informativo/inforegistro.component';

const routes: Routes = [
  { path: 'user/login', component: LoginComponent, title: 'Login'  },
  { path: 'admin/login', component: LoginAdminComponent, title: 'LoginAdmin'  },
  { path: 'pages/registro', component: RegistroComponent, title: 'Registro'  },
  { path: '/inforegistro', component: InfoRegistroComponent, title: 'Registro Exitoso'  }
];

@NgModule({
  declarations: [LoginComponent, LoginAdminComponent, RegistroComponent, InfoRegistroComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgxSpinnerModule
  ]
})
export class LoginModule {}
