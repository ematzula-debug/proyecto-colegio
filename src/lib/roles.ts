export type UserRole =
  | "ADMIN"
  | "PROFESOR_DIRECTOR"
  | "PADRE_ENCARGADO"
  | "ALUMNO";

export const validRoles: UserRole[] = [
  "ADMIN",
  "PROFESOR_DIRECTOR",
  "PADRE_ENCARGADO",
  "ALUMNO",
];

export function isUserRole(role: string): role is UserRole {
  return validRoles.includes(role as UserRole);
}

export function getDefaultPathByRole(role: string) {
  switch (role) {
    case "ADMIN":
      return "/dashboard";

    case "PROFESOR_DIRECTOR":
      return "/dashboard";

    case "PADRE_ENCARGADO":
      return "/notas";

    case "ALUMNO":
      return "/notas";

    default:
      return "/login";
  }
}
