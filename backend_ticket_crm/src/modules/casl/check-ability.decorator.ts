import { SetMetadata } from '@nestjs/common';
import { Action, Subjects } from './types';

export interface RequiredRule {
    action: Action;
    subject: any;
}

export const CHECK_ABILITY = 'check_ability';

export const CheckAbility = (...requirements: RequiredRule[]) =>
    SetMetadata(CHECK_ABILITY, requirements);
