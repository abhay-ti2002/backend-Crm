import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from '../../schemas/ticketSchema/ticket.schema';
import { User, UserSchema } from '../../schemas/userSchema/user.schema';
import { Assignment, AssignmentSchema } from '../../schemas/assignmentSchema/assignment.schema';
import { Order, OrderSchema } from '../../schemas/order/order.schema';
import { Item, ItemSchema } from '../../schemas/itemsSchema/item.schema';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Ticket.name, schema: TicketSchema },
            { name: User.name, schema: UserSchema },
            { name: Assignment.name, schema: AssignmentSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Item.name, schema: ItemSchema },
        ]),
    ],
    providers: [TicketsService],
    controllers: [TicketsController],
    exports: [TicketsService],
})
export class TicketsModule { }
