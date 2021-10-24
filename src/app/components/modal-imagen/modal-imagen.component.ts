import { FileUploadService } from './../../services/file-upload.service';
import { Component, OnInit } from '@angular/core';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-imagen',
  templateUrl: './modal-imagen.component.html',
  styles: [
  ]
})
export class ModalImagenComponent implements OnInit {


  public imagenSubir:File;
  public imgTemp:any=null;


  constructor(public modalImagenService:ModalImagenService,
              private fileUploadService:FileUploadService) { }

  ngOnInit(): void {
  }

  cerrarModal() {
    this.imgTemp = null;
    this.modalImagenService.cerrarModal();
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

    const id = this.modalImagenService.id;
    const tipo = this.modalImagenService.tipo;

    this.fileUploadService.actualizarFoto(this.imagenSubir,tipo,id)
    .then(img=>{
      // this.usuario.img=img;
      Swal.fire('Guardado','Imagen de usuario actualizada','success');
      this.modalImagenService.nuevaImagen.emit(img);
      this.cerrarModal();
    }).catch(err=>{
      Swal.fire('Error','No se puedo subir la imagen','error');
    });
  }

}
