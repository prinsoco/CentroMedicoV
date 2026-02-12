export class AsignacionDto {
asignarId?: string;
perfilId?: number;
menuId?: number;
subMenuId?: number;
estado?: boolean;
fechaCreacion?: Date;
usuarioCreacion?: string;
fechaModificacion?: Date;
usuarioModificacion?: string;
descPerfil?: string;
descMenu?: string;
descSubMenu?: string;
}

export interface IResponseData<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class FiltroAsignacion{
    input?: string;
    combo?: string;
    perfilId?: string;
    menuId?: string;
    subMenuId?: string;
    estado?: string;
}
