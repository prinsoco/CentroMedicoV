export class LoginRequest {
    Email?: string;
    Clave?: string;
}

export class LoginResponse {
    UsuarioId?: number;
    Nombre?: string;
    Usuario?: string;
    Email?: string;
    Clave?: string;
}

export interface IResponseDataLogin<T> {
    code:number;
    info:string;
    message:string;
    data: T;
}

export class LoginAut {
loginNombre?: string;
loginApellidos?: string;
loginIdentificacion?: string;
loginUsuario?: string;
loginId?: number;
loginPerfilId?: number;
loginPerfil?: string;
loginDescPerfil?: string;
loginClave?: string;
loginExpToken?: number;
loginFecUltLogin?: Date;
time?: string;
lastLogin?: string;
token?: string;
refreshToken?: string;
codigo?: number;
mensaje?: string;
loginEspecialidad?:number;
}

export class LoginFiltro{
    usuarioEmail?: string;
    clave?: string;
    tipoUsuario?: string;
}