import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-wanted',
  templateUrl: './wanted.component.html',
  styleUrls: ['./wanted.component.css']
})
export class WantedComponent {

  constructor(
    private api: ApiService
  ) {}

  onSubmit(form: NgForm) {
    this.api.postRequest("wanted", form.value).subscribe((res: any) => {
      
    });
  }
}
