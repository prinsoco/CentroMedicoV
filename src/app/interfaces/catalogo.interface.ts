export class Catalogo {
    catalogoId?: number;
    tipo: string;
    codigo: string;
    descripcion: string;
    estado: boolean;
    usuarioCreacion?: string;
    usuarioModificacion?: string;
    fechaCreacion?: Date;
    fechaModificacion?: Date;
}


export interface IResponseDataCatalogo<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class FiltroCat{
    tipo?: string;
    codigo?: string;
    estado?: string;
    combo?: string
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