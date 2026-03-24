import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
} from '@casl/ability';

import { AppAbility, Subjects } from './casl-ability.type';
import { User, UserRole } from '../../../schemas/userSchema/user.schema';
import { Item } from '../../../schemas/itemsSchema/item.schema';

export function defineAbility(user: User): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility,
  );

  if (user.role === UserRole.ADMIN) {
    can('manage', 'all');
    can('assign', Item);
  }

  if (user.role === UserRole.AGENT) {
    can('read', Item);
    can('create', Item);
    can('update', Item);
  }

  if (user.role === UserRole.CUSTOMER) {
    can('read', Item, { ownerId: user._id });
    cannot('assign', Item);
  }

  return build({
    detectSubjectType: (item: any): ExtractSubjectType<Subjects> =>
      item.constructor as ExtractSubjectType<Subjects>,
  });
}
