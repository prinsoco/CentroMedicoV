export class Parametros {
    paramId?: number;
    tipo?: string;
    codigo?: string;
    valor?: string;
    descripcion?: string;
    estado?: boolean = false;
    usuarioCreacion?: string;
    usuarioModificacion?: string;
}

export interface IResponseDataParametros<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class FiltroParam{
    input?: string;
    combo?: string;
    tipo?: string;
    codigo?: string;
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