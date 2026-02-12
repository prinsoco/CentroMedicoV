export class Notificaciones {
notificacionId?: number;
codigo?: string;
tipo?: string;
canal?: string;
plantilla?: string;
estado?: boolean = true;
usuarioCreacion?: string;
usuarioModificacion?: string;
}

export interface IResponseDataNoti<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class FiltroNoti{
    input?: string;
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