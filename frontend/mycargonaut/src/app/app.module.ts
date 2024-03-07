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
import {NavbarComponent} from "./navbar/navbar.component";
import { ProfileComponent } from './main/profile/profile.component';
import { AdComponent } from './main/ad/ad.component';
import { EditProfileComponent } from './main/edit-profile/edit-profile.component';
import { WantedComponent } from './main/wanted/wanted.component';
import { CreateOfferComponent } from './main/create-offer/create-offer.component';
import { ResultpageComponent } from './resultpage/resultpage.component';
import { AdCardComponent } from './ad-card/ad-card.component';
import { ChatComponent } from './chat/chat.component';
import { CoinModalComponent } from './main/coin-modal/coin-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchbarComponent,
    ProfileComponent,
    AdComponent,
    NavbarComponent,
    AdComponent,
    EditProfileComponent,
    WantedComponent,
    CreateOfferComponent,
    ResultpageComponent,
    AdCardComponent,
    ChatComponent,
    CoinModalComponent,
  ],
  imports: [
    AuthModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  exports:[
    NavbarComponent,
    HttpClientModule,
    SearchbarComponent,

  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
