import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard
  implements CanActivate
{
  constructor(
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {

    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    console.log(
      'Required Roles:',
      requiredRoles,
    );

    const request =
      context.switchToHttp().getRequest();

    console.log(
      'Request User:',
      request.user,
    );

    if (!requiredRoles) {
      return true;
    }

    const user = request.user;

    const result =
      requiredRoles.includes(
        user.role,
      );

    console.log(
      'Role Check Result:',
      result,
    );

    return result;
  }
}