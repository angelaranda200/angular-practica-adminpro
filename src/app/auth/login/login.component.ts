import { Component, NgZone, OnInit} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'


import { UsuarioService } from 'src/app/services/usuario.service';

declare const gapi:any;



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public formSubmitted = false;
  public auth2:any;

  public loginForm=this.fb.group({
   
    email:[localStorage.getItem('email')||'',[Validators.required,Validators.email]],
    password:['123456',Validators.required],
    remember:[false]
  });

  constructor(private router:Router,
              private fb:FormBuilder,
              private usuarioService:UsuarioService,
              private ngZone:NgZone) { }
  ngOnInit(): void {
    this.renderButton();
  }

  

  login(){

    this.usuarioService.login(this.loginForm.value)
    .subscribe(resp=>{
      console.log(resp);
      if (this.loginForm.get('remember')?.value) {
        localStorage.setItem('email',this.loginForm.get('email')?.value)
      } else {
        localStorage.removeItem('email')
      }
      this.router.navigateByUrl('/');
      
    },(err)=>{
        Swal.fire('Error',err.error.msg,'error');
    })
    // console.log(this.loginForm.value);
    


  }
  // var id_token = googleUser.getAuthResponse().id_token;


  
  renderButton() {
    gapi.signin2.render('my-signin2', {
      'scope': 'profile email',
      'width': 240,
      'height': 50,
      'longtitle': true,
      'theme': 'dark',
      
    });

    this.startApp();


  }

   async startApp() {
    // gapi.load('auth2', ()=>{
    //   // Retrieve the singleton for the GoogleAuth library and set up the client.
    //   this.auth2 = gapi.auth2.init({
    //     client_id: '637577887431-r9g0d0mp6p1am811a30comerl92ajm33.apps.googleusercontent.com',
    //     cookiepolicy: 'single_host_origin',
        
    //   });
    await this.usuarioService.googleInit();
    this.auth2 = this.usuarioService.auth2;
      this.attachSignin(document.getElementById('my-signin2'));
    };

    attachSignin(element:any) {
      console.log(element.id);
      this.auth2.attachClickHandler(element, {},
          (googleUser:any)=> {
              const id_token = googleUser.getAuthResponse().id_token;
              // console.log(id_token);
              this.usuarioService.loginGoogle(id_token)
                                  .subscribe(resp=>{
                                    this.ngZone.run(()=>{
  
                                      this.router.navigateByUrl('/')
                                    });
                                   } );
              
              this.router.navigateByUrl('/');
  
          }, (error:any)=> {
            alert(JSON.stringify(error, undefined, 2));
          });
    }
  }
  

