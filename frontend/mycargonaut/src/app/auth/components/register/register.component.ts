import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
  isLogin: boolean = false;

  constructor(
    private api: ApiService,
  ){}
  onSubmit(form: NgForm){
    console.log("Form triggered")
    console.log(form.value)
    this.api.postRequest("user/register", form.value).subscribe((res:any) =>{
      console.log(res)
    })
  }
  ngOnInit(): void {
      console.log("init functionality")
  }
}