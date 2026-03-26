// src/casl/check-ability.decorator.ts

import { SetMetadata } from '@nestjs/common';

export interface RequiredRule {
  action: string;
  subject: any;
}

export const CHECK_ABILITY = 'check_ability';

export const CheckAbility = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);
