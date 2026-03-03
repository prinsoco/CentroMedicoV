export class Feriado {
    feriadoId?: number;
    anio?: number;
    mes?: number;
    dia?: number;
    descripcion?: string;
    estado?: boolean;
    fechaCreacion?: Date;
    usuarioCreacion?: string;
    fechaModificacion?: Date;
    usuarioModificacion?: string;
    fecha?: string;
}

export interface IResponseDataFeriado<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class Filtro{
    anio?: string;
}

export class FiltroFeriado{
    anio?: string;
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