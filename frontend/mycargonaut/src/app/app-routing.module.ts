import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './auth/components/register/register.component';
import { LoginComponent } from './auth/components/login/login.component';
import { HomeComponent } from './main/home/home.component';
import { ProfileComponent } from './main/profile/profile.component';
import { authguardGuard } from './guard/authguard.guard';
import {RatingComponent} from "./rating/rating.component";

const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: '', component: HomeComponent},
  {path: 'profile', component: ProfileComponent, canActivate: [authguardGuard]},
  {path: 'rating', component: RatingComponent}
  //{path: 'test', component: TestComponent,canActivate: [authguardGuard]} Beispiel einer Route mit authguard
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
