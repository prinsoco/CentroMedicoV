export class Paciente {
    pacienteId?: number;
    perfilId?: number;
    descPerfil?: string;
    nombres?: string;
    apellidos?: string;
    identificacion?: string;
    email?: string;
    edad?: number;
    usuario?: string;
    telefono?: string;
    celular?: string;
    direccion?: string;
    estado?: boolean;
    usuarioCreacion?: string;
    usuarioModificacion?: string;
    clave?: string;
    notificacion?: boolean;
    pacienteInfo?: string
}

export interface IResponseDataPaciente<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class Filtro{
    input?: string;
}

export class FiltroPaciente{
    input?: string;
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