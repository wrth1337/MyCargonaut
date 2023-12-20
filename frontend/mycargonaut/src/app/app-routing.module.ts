import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './auth/components/register/register.component';
import {SearchbarComponent} from "./searchbar/searchbar.component";

const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  {path: 'searchbar/search', component: SearchbarComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
