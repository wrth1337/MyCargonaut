import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {AuthModule} from "./auth/auth.module";
import { SearchbarComponent } from './searchbar/searchbar.component';
import { InterceptorService } from './service/interceptor.service';
import { HomeComponent } from './main/home/home.component';
import { ProfileComponent } from './main/profile/profile.component';
import { EditProfileComponent } from './main/edit-profile/edit-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchbarComponent,
    HomeComponent,
    ProfileComponent,
    EditProfileComponent,
  ],
  imports: [
    AuthModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports:[
    SearchbarComponent
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true}],
  bootstrap: [AppComponent, SearchbarComponent]
})
export class AppModule { }
