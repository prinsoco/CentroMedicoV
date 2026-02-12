import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CitasServices } from '../../services/citas.service';
import { Cita, Citas, CitasMedico, HorariosMedico, HorasLaborales, InfoModal } from '../../interfaces/citas.interface';
import { Medico } from '../../interfaces/medico.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NotifierService } from 'angular-notifier';
import Swal from 'sweetalert2';
import { UtilsGeneral } from '../../shared/utils/utils-general';

@Component({
  selector: 'app-modal-citas',
  templateUrl: './modal-citas-medico.component.html',
  styleUrls: ['./modal-citas-medico.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalCitasComponent implements OnInit {
  @ViewChild('modalConfirmarCita') modalConfirmarCita!: NgbModal;
  @ViewChild('modalSuccess') modalSuccess!: NgbModal;
  @Input() dataInfoCitasHorario: InfoModal;
  dataForm: FormGroup;
  citas: any[] = [];
  horarioLaboral: HorasLaborales[] = [];
  horariosMedico: HorariosMedico[] = [];
  citasProgramada: CitasMedico[] = [];

  constructor(private apiServices: CitasServices,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private notifier: NotifierService,
    private classGeneral: UtilsGeneral
  ) {}

  ngOnInit(): void {
    this.validateForms();
    this.cargarHorarioCita();
  }

  validateForms(){
         this.dataForm = this.fb.group({
        horario: ['0']
    });

    this.dataForm.controls['horario'].setValue("0");
  }

  async cargarHorarioCita() {
    console.log("this.dataInfoCitasHorario: " + this.dataInfoCitasHorario);
    var response = await this.apiServices.getAllHorario(this.dataInfoCitasHorario.medicoId+"", this.dataInfoCitasHorario.especialidadId+"", "0", this.dataInfoCitasHorario.fechaDia).toPromise();
    this.horariosMedico = response?.data ?? [];
    const resp = this.horariosMedico.filter(r => r.medicoId === this.dataInfoCitasHorario.medicoId && 
      this.classGeneral.fechaLocal(r.fechaInicioLaboral) === this.dataInfoCitasHorario.fechaDia);
      
      if(resp.length > 0){
        //this.horarioLaboral = resp[0].horarioLaboral?.filter(r => this.fechaLocal(r.hora) === this.dataInfoCitasHorario.fechaDia) ?? [];
        this.horarioLaboral = resp[0].horarioLaboral?.filter(r => new Date(r.hora) > new Date()) ?? [];
      }
  }

  cargarCitas() {
    console.log(this.dataInfoCitasHorario);
    /*this.horarioLaboral = this.dataInfoCitasHorario.horarioLaboral.filter(r => {

        const existeCita = this.dataInfoCitasHorario.citaMedico.some(cita =>
          cita.fechaCita === r.hora &&
          cita.medicoId === r.medicoId 
        );

        return !existeCita; // ❌ excluir los que ya tienen cita
      });*/
  }

  cerrar(){
        this.classGeneral.closeModal(this.modalService);
        //this.modalService.dismissAll();
  }

  async agregarCita(){
        //this.spinner.show();
        const rangoCita = this.dataForm.controls['horario'].value;

        if(rangoCita != "0"){
          var itemCita = this.horarioLaboral.find(r => r.idRango == parseInt(rangoCita));
          if(new Date() > new Date(itemCita.hora)){
            this.classGeneral.showNotificationNotify(3, "top","right", "No se puede agendar una cita, hora actual es mayor a la hora seleccionada.");
            //this.showNotificationLabel(3, "top","right", "No se puede agendar una cita, hora actual es mayor a la hora seleccionada.");
          }
          else{
            var citaNew: Cita = {
              medicoId: itemCita.medicoId,
              pacienteId: this.dataInfoCitasHorario.pacienteId,
              usuarioCreacion: "admin",
              fechaCita: itemCita.hora,
              paciente: this.dataInfoCitasHorario.paciente,
              medico: this.dataInfoCitasHorario.nombres,
              especialidad: this.dataInfoCitasHorario.descEspecialidad
            };

            var resp = await this.apiServices.create(citaNew).toPromise()
            .then(rdata => {
                //this.spinner.hide();
                const id = rdata["id"];
                if(id === -9999 || id === -1111 || id === 0 || id === -2222)
                {
                  this.classGeneral.showNotificationNotify(3, "top","right", rdata["message"]);
                  //this.showNotificationLabel(3, "top","right", rdata["message"]);
                }
                else{
                    this.classGeneral.showNotificationNotify(2, "top","right", rdata["message"]);
                    //this.showNotificationLabel(2, "top","right", rdata["message"]);
                    this.cerrar();
                }
                
                
            }).catch((err) => {
                //this.spinner.hide();
                this.classGeneral.showNotificationNotify(4, "top","right", err["message"]);
                //this.showNotificationLabel(4, "top","right", err["message"]);
            });
          }
        }
        else{
          this.classGeneral.showNotificationNotify(3, "top","right", "Debe seleccionar un horario, para agendar");
          //this.showNotificationLabel(3, "top","right", "Debe seleccionar un horario, para agendar");
        }
    }

async validarCita(){
    const resp = this.horariosMedico.filter(r => r.medicoId === this.dataInfoCitasHorario.medicoId && 
      this.classGeneral.fechaLocal(r.fechaInicioLaboral) === this.dataInfoCitasHorario.fechaDia);
      
      if(resp.length > 0){
        this.citasProgramada = resp[0].citas?.filter(r => this.classGeneral.fechaLocal(r.fechaCita) === this.dataInfoCitasHorario.fechaDia
                                                      && r.pacienteId === this.dataInfoCitasHorario.pacienteId) ?? [];

        if(this.citasProgramada != null && this.citasProgramada.length > 0){
          this.abrirModalConfirmacion(this.citasProgramada[0].citaId);
        }
        else{
          this.agregarCita();
        }
      }
}

abrirModalConfirmacion(citaId?: number){
  Swal.fire({
    title: 'Confirmación nueva cita',
    text: '¿Está seguro que desea cancelar la cita actual y agendar la cita con el nuevo horario?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  }).then(result => {
    if (result.isConfirmed) {
      this.actualizarCita(citaId);
    }
  });
}

async actualizarCita(citaId?: number){
        const rangoCita = this.dataForm.controls['horario'].value;

        if(rangoCita != "0"){
          var itemCita = this.horarioLaboral.find(r => r.idRango == parseInt(rangoCita));

            var citaNew: Cita = {
              citaId: citaId,
              medicoId: itemCita.medicoId,
              pacienteId: this.dataInfoCitasHorario.pacienteId,
              usuarioModificacion: "admin",
              fechaCita: this.citasProgramada[0].fechaCita,// itemCita.hora,
              estadoCita: "CANC",
              paciente: this.dataInfoCitasHorario.paciente,
              medico: this.dataInfoCitasHorario.nombres,
              especialidad: this.dataInfoCitasHorario.descEspecialidad
            };

            var resp = await this.apiServices.edit(citaNew).toPromise()
            .then(rdata => {
                //this.spinner.hide();
                if(rdata["id"] == 0)
                {
                  this.agregarCita();
                }
                
            }).catch((err) => {
                //this.spinner.hide();
                this.classGeneral.showNotificationNotify(4, "top","right", err["message"]);
                //this.showNotificationLabel(4, "top","right", err["message"]);
            });
        }
        else{
          this.classGeneral.showNotificationNotify(3, "top","right", "Debe seleccionar un horario, para agendar");
          //this.showNotificationLabel(3, "top","right", "Debe seleccionar un horario, para agendar");
        }
    }
}
