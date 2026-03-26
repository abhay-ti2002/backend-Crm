import { AbilityBuilder, createMongoAbility, ExtractSubjectType } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../../schemas/userSchema/user.schema';
import { Ticket } from '../../schemas/ticketSchema/ticket.schema';
import { Product } from '../../schemas/productSchema/product.schema';
import { Order } from '../../schemas/order/order.schema';
import { Item } from '../../schemas/itemsSchema/item.schema';
import { AppAbility, Subjects, Action } from './types';

@Injectable()
export class CaslAbilityFactory {
    defineAbility(user: User): AppAbility {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

        if (user.role === UserRole.ADMIN) {
            can('manage', 'all')
        } else if (user.role === UserRole.AGENT) {
            can('browse', 'all');
            can('read', 'all');
            can('edit', Ticket);
            can('forward', Ticket);
            can('update', Ticket);
            can('browse', Item);
            can('read', Item);
            can('edit', Item);
            can('browse', Product);
            can('read', Product);
            can('browse', Order);
            can('read', Order); 
            can('update', Item);
        } else if (user.role === UserRole.CUSTOMER) {
          
            can('add', Ticket);
            can('read', Ticket, { createdBy: user._id });
            can('browse', Order, { customerId: user._id });
            can('read', Order, { customerId: user._id });
            can('read', Item, { ownerId: user._id });
            can('browse', Product);
            can('read', Product);
            can('create', Ticket);
        }

        return build({
            detectSubjectType: (item) =>
                item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
