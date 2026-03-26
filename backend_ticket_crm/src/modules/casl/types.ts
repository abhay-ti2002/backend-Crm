import { InferSubjects, MongoAbility } from '@casl/ability';
import { User } from '../../schemas/userSchema/user.schema';
import { Ticket } from '../../schemas/ticketSchema/ticket.schema';
import { Product } from '../../schemas/productSchema/product.schema';
import { Order } from '../../schemas/order/order.schema';
import { Item } from '../../schemas/itemsSchema/item.schema';

export type Action = 'manage' | 'browse' | 'read' | 'edit' | 'add' | 'delete' | 'create' | 'update' | 'assign' | 'forward';

export type Subjects = InferSubjects<typeof Ticket | typeof Product | typeof Order | typeof User | typeof Item> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;
