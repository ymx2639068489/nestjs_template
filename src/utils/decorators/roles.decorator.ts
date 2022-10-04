import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);

/**
 * 
 * @param f [-1, 1]
 * -1: local
 * 0 : none
 * 1 : jwt (默认)
 */
export const NoAuth = (f = 1) => SetMetadata('no-auth', f);
