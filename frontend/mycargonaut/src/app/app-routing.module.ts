import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './auth/components/register/register.component';
import { LoginComponent } from './auth/components/login/login.component';
import { HomeComponent } from './main/home/home.component';
import { ProfileComponent } from './main/profile/profile.component';
import { EditProfileComponent } from './main/edit-profile/edit-profile.component';
import { authguardGuard } from './guard/authguard.guard';
import { SearchbarComponent } from "./searchbar/searchbar.component";
import {ResultpageComponent} from "./resultpage/resultpage.component";
import { AdComponent } from './main/ad/ad.component';

const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: '', component: HomeComponent},
  {path: 'profile', component: ProfileComponent, canActivate: [authguardGuard]},
  {path: 'edit_profile', component: EditProfileComponent, canActivate: [authguardGuard]},
  {path: 'ad/:id', component: AdComponent},

  {path: 'searchbar/search', component: SearchbarComponent},
  {path: 'resultpage', component: ResultpageComponent},
  //{path: 'test', component: TestComponent,canActivate: [authguardGuard]} Beispiel einer Route mit authguard
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
