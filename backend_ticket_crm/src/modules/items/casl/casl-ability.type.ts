import { MongoAbility } from '@casl/ability';
import { Item } from '../../../schemas/itemsSchema/item.schema';

export type Subjects = typeof Item | 'all';

export type AppAbility = MongoAbility<[string, Subjects]>;
