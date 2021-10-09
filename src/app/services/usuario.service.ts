import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoginForm } from '../interfaces/login-form.interface';
import { RegisterForm } from '../interfaces/register-form.interface';


const base_url = environment.base_url;

declare const gapi:any;


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  public auth2:any;

  constructor(private http:HttpClient,
              private router:Router,
              private ngZone:NgZone) {
                this.googleInit();
               }

  googleInit(){

    return new Promise<void>(resolve=>{

      gapi.load('auth2', ()=>{
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        this.auth2 = gapi.auth2.init({
          client_id: '637577887431-r9g0d0mp6p1am811a30comerl92ajm33.apps.googleusercontent.com',
          cookiepolicy: 'single_host_origin',
          // Request scopes in addition to 'profile' and 'email'
          //scope: 'additional_scope'
        });
        resolve();
      });
    });
  }    

  logout(){
    localStorage.removeItem('token');

    this.auth2.signOut().then(()=>{
      this.ngZone.run(()=>{
        this.router.navigateByUrl('/login');

      });
      
    });
  }

  validarToken():Observable<boolean>{
    const token = localStorage.getItem('token')||'';

    return this.http.get(`${base_url}/login/renew`,{
      headers:{
        'x-token':token
      }
    }).pipe(
      tap((resp:any)=>{
        localStorage.setItem('token',resp.token);
      }),
      map(resp=>true),
      catchError(error=>of(false))
    );
  }


  crearUsuario(formData:RegisterForm){
    
    
     return this.http.post(`${base_url}/usuarios`,formData);
    
  }

  login(formData:LoginForm){
    return this.http.post(`${base_url}/login`,formData)
                .pipe(
                  tap((resp:any)=>{
                    localStorage.setItem('token',resp.token);
                  })
                )
  }
  loginGoogle(token){
    return this.http.post(`${base_url}/login/google`,{token})
                .pipe(
                  tap((resp:any)=>{
                    localStorage.setItem('token',resp.token);
                  })
                )
  }
}
