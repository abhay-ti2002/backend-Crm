import { Controller, Post, Body, Get, UseGuards, Request, Patch, Param, Req } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CaslGuard } from '../casl/casl.guard';
import { CheckAbility } from '../casl/check-ability.decorator';
import { UserRole } from '../../schemas/userSchema/user.schema';
import { Ticket } from '../../schemas/ticketSchema/ticket.schema';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard, CaslGuard)
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post()
    @CheckAbility({ action: 'add', subject: Ticket })
    async create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
        const userId = req.user.id;
        return this.ticketsService.create(createTicketDto, userId);
    }

    @Get('history')
    @CheckAbility({ action: 'browse', subject: Ticket })
    async getHistory() {
        return this.ticketsService.getHistory();
    }

    @Get()
    @CheckAbility({ action: 'browse', subject: Ticket })
    async findAll(@Request() req) {
        return this.ticketsService.findAll(req.user);
    }

    @Get(':id')
    @CheckAbility({ action: 'read', subject: Ticket })
    async findOne(@Param('id') id: string, @Req() req) {
        const ticket = await this.ticketsService.findOne(id, req.user);
        req.subject = ticket; // 🔥 attach here
        return ticket;
    }

    @Patch(':id/status')
    @CheckAbility({ action: 'edit', subject: Ticket })
    async updateStatus(
        @Param('id') id: string,
        @Body() updateDto: UpdateTicketStatusDto,
        @Req() req,
    ) {
        const ticket = await this.ticketsService.findById(id);
        req.subject = ticket; // 🔥 attach here
        const userId = req.user.id;
        return this.ticketsService.updateStatus(id, updateDto.status, userId);
    }

    @Patch(':id/forward')
    @CheckAbility({ action: 'forward', subject: Ticket })
    async forward(@Param('id') id: string, @Req() req) {
        const ticket = await this.ticketsService.findById(id);
        req.subject = ticket; // 🔥 attach here
        const userId = req.user.id;
        return this.ticketsService.forwardTicket(id, userId);
    }
}
