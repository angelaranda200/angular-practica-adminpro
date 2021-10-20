import  Swal  from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Usuario } from 'src/app/models/usuario.model';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { UsuarioService } from 'src/app/services/usuario.service';

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styles: [
  ]
})
export class PerfilComponent implements OnInit {

  public perfilForm:FormGroup;
  public usuario:Usuario;
  public imagenSubir:File;
  public imgTemp:any=null;
  
  
 

  constructor(private fb:FormBuilder,
              private usuarioService:UsuarioService,
              private fileUploadService:FileUploadService) { 
                this.usuario = usuarioService.usuario;
                
              }

  ngOnInit(): void {
    this.perfilForm = this.fb.group({
      nombre:[this.usuario.nombre,Validators.required],
      email:[this.usuario.email,[Validators.required,Validators.email]]
    })
  }

  actualizarPerfil(){
    console.log(this.perfilForm.value);
    this.usuarioService.actualizarPerfil(this.perfilForm.value)
    .subscribe(resp=>{
      const {nombre,email}=this.perfilForm.value;
      this.usuario.nombre=nombre;
      this.usuario.email=email;

      Swal.fire('Guardado','Cambios fueron guardados','success');
      
    },(err)=>{
      Swal.fire('Error',err.error.msg,'error');
      
    });
    
  }

  cambiarImagen(files){
    
    files = (event.target as HTMLInputElement).files[0];
    this.imagenSubir = files;
    
    if (!files) {
      return this.imgTemp = null;
    }

    const reader = new FileReader();
    reader.readAsDataURL(files);

    reader.onloadend=()=>{
      this.imgTemp= reader.result
      
      
    }
    
  }

  subirImagen(){
    this.fileUploadService.actualizarFoto(this.imagenSubir,'usuarios',this.usuario.uid)
    .then(img=>{
      this.usuario.img=img;
      Swal.fire('Guardado','Imagen de usuario actualizada','success');
    }).catch(err=>{
      Swal.fire('Error','No se puedo subir la imagen','error');
    });
  }

}
