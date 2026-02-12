export interface Citas {
  doctorId: number;
  fecha: string; // yyyy-MM-dd
  hora: string;  // HH:mm
  paciente: string;
}

export interface Cita {
  citaId?: number;
  medicoId?: number;
  fechaCita?: Date; // yyyy-MM-dd
  pacienteId?: number;
  estado?: boolean;
  motivo?: string;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
  estadoCita?: string;
  medico?: string;
  paciente?: string;
  especialidad?: string;
  descEstadoCita?: string;
}

export interface IResponseDataCita<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class Filtro{
    input?: string;
}

export class FiltroCitaAsig{
    input?: string;
    fechaInicio?: string;
    fechaFin?: string;
    combo?: string;
    medicoId?: number;
    paciente?: number;
    estadoCita?: string;
    especialidadId?: number;
    reporte?: string;
}

export class Horarios{
    doctorId?: number;
    dias?: string[];
    rangos?: {
      desde: string;
      hasta: string;
    }[];
}

//Horarios
export class HorariosMedico
{
    medicoId?: number;
    nombre?: string;
    especialidadId?: number;
    especialidad?: string;
    foto?: string;
    horarioTexto?: string;
    fechaInicioLaboral?: Date;
    fechaFinalLaboral?: Date;
    diasAtencion?: string[] = [];
    horarioLaboral?: HorasLaborales[] = [];
    citas?: CitasMedico[] = [];
}

export class HorasLaborales
{
    idRango?: number;
    medicoId?: number;
    nombre?: string;
    hora?: Date;
    fechaInicio?: Date;
    fechaFin?: Date;
}

export class Feriados
{
    feriadoId?: number;
    anio?: number;
    mes?: number;
    dia?: number;
    foto?: string;
    descripcion?: string;
    fechaCreacion?: Date;
    usuarioCreacion?: string;
}

export class CitasMedico
{
    citaId?: number;
    medicoId?: number;
    pacienteId?: number;
    fechaCita?: Date;
    motivo?: string;
    estadoCita?: string;
    descEstadoCita?: string;
}

export class InfoModal
{
    medicoId?: number;
    nombres?: string;
    descEspecialidad?: string;
    horario?: string;
    especialidadId?: number;
    pacienteId?: number;
    fechaDia?: string;
    paciente?: string;
}