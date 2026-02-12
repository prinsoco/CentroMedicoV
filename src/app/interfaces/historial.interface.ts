export class HistorialClinico{
    historialId?: number;
    pacienteId?: number;
    citaId?: number;
    medicoId?: number;
    diagnostico?: string;
    receta?: string;
    estado?: boolean;
    usuarioCreacion?: string;
    fechaCreacion?: Date;
    usuarioModificacion?: string;
    fechaModificacion?: Date;
    descHistorial?: string;
    estadoCita?: string;
    paciente?: string;
    medico?: string;
    especialidad?: string;
    descEstadoCita?: string;
}

export interface IResponseDataHistorial<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class FiltroHistorial{
    pacienteId?: string;
    citaId?: string;
    medicoId?: string;
    fechaInicio?: string;
    fechaFin?: string;
}