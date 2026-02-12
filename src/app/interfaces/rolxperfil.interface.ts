export class Perfil {
    perfilId?: number;
    descripcion?: string;
    estado?: boolean;
    codigo?: string;
    usuarioCreacion?: string;
    usuarioModificacion?: string;
}

export interface IResponseDataGeneral<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class Rol {
    rolId?: number;
    descripcion?: string;
    codigo?: string;
    estado?: boolean
    usuarioCreacion?: string;
    usuarioModificacion?: string;
}

export class Menu {
    IdMenu: number;
    Menu: string;
    IdRol: number;
    Rol: string;
    Path: string;
    Icono: string;
    Class: string;
}

export class FiltroPerfil{
    input?: string;
    combo?: string;
}

export class Filtro{
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

