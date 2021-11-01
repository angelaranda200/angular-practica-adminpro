import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { CargarUsuario } from '../interfaces/cargar-usuarios.interface';
import { LoginForm } from '../interfaces/login-form.interface';
import { RegisterForm } from '../interfaces/register-form.interface';
import { Usuario } from '../models/usuario.model';


const base_url = environment.base_url;

declare const gapi:any;


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  public auth2:any;
  public usuario!:Usuario;

  constructor(private http:HttpClient,
              private router:Router,
              private ngZone:NgZone) {
                this.googleInit();
               }
  get token():string{
    return localStorage.getItem('token')||'';
  }   
  
  get role():'ADMIN_ROLE'| 'USER_ROLE'{
    return this.usuario.role;
  }
  
  get uid():string{
    return this.usuario.uid||'';
  }

  get headers(){
    return {
      headers:{
        'x-token':this.token
      }
    }
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

  guardarLocalStorage(token:string, menu :any){
    localStorage.setItem('token',token);
    localStorage.setItem('menu',JSON.stringify(menu));
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('menu');

    this.auth2.signOut().then(()=>{
      this.ngZone.run(()=>{
        this.router.navigateByUrl('/login');

      });
      
    });
  }

  validarToken():Observable<boolean>{
    
    return this.http.get(`${base_url}/login/renew`,{
      headers:{
        'x-token':this.token
      }
    }).pipe(
      map((resp:any)=>{

        const {email,google,nombre,role,uid,img=''}=resp.usuario;
        
        this.usuario= new Usuario(nombre,email,'',img,google,role,uid);
        
        this.guardarLocalStorage(resp.token,resp.menu);
        return true
      }),
      
      catchError(error=>of(false))
    );
  }


  crearUsuario(formData:RegisterForm){
    
    
     return this.http.post(`${base_url}/usuarios`,formData)
             .pipe(
               tap((resp:any)=>{
                 this.guardarLocalStorage(resp.token,resp.menu);

               })
             )
    
  }

  actualizarPerfil(data:{email:string,nombre:string,role:string}){

    data={
      ...data,
      role:this.usuario.role
    }
    
    return this.http.put(`${base_url}/usuarios/${this.uid}`,data,this.headers);

  }

  login(formData:LoginForm){
    return this.http.post(`${base_url}/login`,formData)
                .pipe(
                  tap((resp:any)=>{
                    this.guardarLocalStorage(resp.token,resp.menu);

                  })
                )
  }
  loginGoogle(token:any){
    return this.http.post(`${base_url}/login/google`,{token})
                .pipe(
                  tap((resp:any)=>{
                    this.guardarLocalStorage(resp.token,resp.menu);

                  })
                )
  }

  cargarUsuarios(desde:number=0){
    const url =`${base_url}/usuarios?desde=${desde}`;
    return this.http.get<CargarUsuario>(url,this.headers)
    .pipe(
      map(resp=>{
        const usuarios = resp.usuarios.map(
          user=>new Usuario(user.nombre,user.email,'',user.img,user.google,user.role,user.uid))
        
        return {
          total:resp.total,
          usuarios
        };
      })
    )
  }

  eliminarUsuario(usuario:Usuario){
    const url =`${base_url}/usuarios/${usuario.uid}`;
    return this.http.delete(url,this.headers)
    
  }

  guardarUsuario(usuario:Usuario){

    
    return this.http.put(`${base_url}/usuarios/${usuario.uid}`,usuario,this.headers);

  }
}
