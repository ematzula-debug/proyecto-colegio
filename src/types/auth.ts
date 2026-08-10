export interface LoginRequest {
  usuario: string;
  contrasena: string;
}

export interface AuthUser {
  id: number;
  nombreUsuario: string;
  correo: string;
  rol: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: AuthUser;
  };
}
