import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Medico } from 'src/app/models/medico.model';
import { BusquedasService } from 'src/app/services/busquedas.service';
import { MedicoService } from 'src/app/services/medico.service';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medicos',
  templateUrl: './medicos.component.html',
  styles: [
  ]
})
export class MedicosComponent implements OnInit,OnDestroy {

  public medicos:Medico[]=[];
  public cargando:boolean=true;
  private imgSubs: Subscription;

  constructor(private medicoService:MedicoService,
              private modalImagenService:ModalImagenService,
              private busquedasServices:BusquedasService) { }
  ngOnDestroy(): void {
    this.imgSubs.unsubscribe();
  }

  ngOnInit(): void {
    this.cargarMedicos();
    this.imgSubs=this.imgSubs=this.modalImagenService.nuevaImagen
   .pipe(
     delay(100)
   )
   .subscribe(img=>{this.cargarMedicos()});

  }

  buscar(termino:string){
    if (termino.length===0) {

      return this.cargarMedicos();
    }
    this.busquedasServices.buscar('medicos',termino)
    .subscribe((resultados:Medico[])=>{
      this.medicos=resultados;
    }
    ) 
  }

  cargarMedicos(){
    this.cargando=true;
    this.medicoService.cargarMedicos()
    .subscribe(medicos=>{
      this.cargando=false;
      this.medicos=medicos;
    })
  }

  borrarMedico(medico:Medico){
    Swal.fire({
      title: '¿Borrar medico?',
      text: `Esta a punto de borrar a ${medico.nombre}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, borrarlo'
    }).then((result) => {
      if (result.isConfirmed) {
        this.medicoService.eliminarMedico(medico._id)
        .subscribe(resp=>{
          this.cargarMedicos();
          Swal.fire(
            'Medico borrado',
            `${medico.nombre} fue eliminado correctamente`,
            'success'
          )
        });
      }
    })
  }

  abrirModal(medico:Medico){
    this.modalImagenService.abrirModal('medicos',medico._id,medico.img);

  }

}
