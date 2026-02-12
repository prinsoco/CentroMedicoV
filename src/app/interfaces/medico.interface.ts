export class Medico {
    medicoId?: number;
    especialidadId?: number;
    descEspecialidad?: string;
    perfilId?: number;
    descPerfil?: string;
    nombres: string;
    apellidos: string;
    identificacion: string;
    email: string;
    edad: number;
    usuario: string;
    telefono: string;
    celular: string;
    direccion: string;
    estado: boolean;
    usuarioCreacion?: string;
    usuarioModificacion?: string;
    horario?: string;
}

export interface IResponseDataMedico<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class Filtro{
    input?: string;
}

export class FiltroMedico{
    input?: string;
    identificacion?: string;
    combo?: string;
    especialidadId?: string;
    medicoId?: string;
    reporte?: string;
}

export class Response{
    mensaje?: string;
    accion: number;
    proceso?: string;
    datos: FilterString[];
}

export class FilterString{
    codigo?: string;
}

export interface Doctor {
  id: number;
  nombre: string;
  especialidad: string;
  foto: string;
  horarioTexto: string;
  diasAtencion: number[];
}

