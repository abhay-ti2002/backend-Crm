import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../../../schemas/ticketSchema/ticket.schema';

export class UpdateTicketStatusDto {
    @ApiProperty({ enum: TicketStatus, example: TicketStatus.RESOLVED })
    @IsNotEmpty()
    @IsEnum(TicketStatus)
    status: TicketStatus;
}
