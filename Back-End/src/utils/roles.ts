import { env } from "../config/env";

export const ROLE_ADMIN = env.adminRole;
export const ROLE_GARCOM = "Garçom";
export const ROLE_CLIENTE = "Cliente";

export function normalizeRole(value: string): string {
  return value.trim().toLowerCase();
}

export function isRole(value: string, role: string): boolean {
  return normalizeRole(value) === normalizeRole(role);
}

export function isAdminRole(value: string): boolean {
  return isRole(value, ROLE_ADMIN);
}

export function isClienteRole(value: string): boolean {
  return isRole(value, ROLE_CLIENTE);
}

export function isStaffRole(value: string): boolean {
  return isAdminRole(value) || isRole(value, ROLE_GARCOM);
}
