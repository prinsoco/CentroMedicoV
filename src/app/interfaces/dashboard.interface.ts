export class SeccionOne {
    medicos?: number;
    especialidades?: number;
    citasAsistidas?: number;
    pacientes?: number;
}


export interface IResponseDataDashBoard<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class Filtro{
    tipo?: string;
    codigo?: string;
    estado?: boolean;
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