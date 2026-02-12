//Usuario
export class Usuario {
    usuarioId?: number;
    usuarioLogin?: string;
    descPerfil?: string;
    perfilId?: number;
    nombres?: string;
    apellidos?: string;
    identificacion?: string;
    email?: string;
    edad?: number;
    telefono?: string;
    celular?: string;
    direccion?: string;
    estado?: boolean;
    usuarioCreacion?: string;
    usuarioModificacion?: string;
}

export interface IResponseDataUsuario<T> {
    code:number;
    info:string;
    message:string;
    data: T;
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

export class Perfil {
    PerfilId?: number;
    Descripcion: string;
    Estado: boolean;
    UsuarioCreacion: string;
    UsuarioModificacion: string;
}

export class Rol {
    RolId?: number;
    Descripcion: string;
    Estado?: boolean
    UsuarioCreacion: string;
    UsuarioModificacion: string;
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

