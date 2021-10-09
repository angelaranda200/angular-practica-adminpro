import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { tap } from 'rxjs/operators';

import { UsuarioService } from '../services/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private usuarioService:UsuarioService,
              private router:Router){}


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      
      
      
      console.log('paso por el canActivate del guard');
      
    return this.usuarioService.validarToken()
    .pipe(
      tap(estaAutenticado=>{
        if (!estaAutenticado) {
          this.router.navigateByUrl('/login');
        }
      })
    )
  }
  
}
