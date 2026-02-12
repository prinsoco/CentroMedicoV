export class Menu {
    menuId?: number;
    codMenu?: string;
    descMenu?: string;
    path?: string;
    collapse?: string;
    codTipo?: string;
    tipo?: string;
    iconTipo?: string;
    estado?: boolean;
    fechaCreacion?: Date;
    usuarioCreacion?: string;
    fechaModificacion?: Date
    usuarioModificacion?: string;
    descTipo?: string;
}

export interface IResponseData<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class FiltroMenu{
    input?: string;
    combo?: string;
    tipo?: string;
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

//Sub menu
export class SubMenu {
    subMenuId?: number;
    menuId?: number;
    descSubMenu?: string;
    path?: string;
    abreviatura?: string;
    estado?: boolean;
    fechaCreacion?: Date;
    usuarioCreacion?: string;
    fechaModificacion?: Date
    usuarioModificacion?: string;
    descMenu?: string;
}

export class FiltroSubmenu{
    input?: string;
    combo?: string;
    tipo?: string;
    menuId?: string;
}