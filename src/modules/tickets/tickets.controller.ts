import { Controller, Post, Body, Get, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UserRole } from '../../schemas/userSchema/user.schema';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post()
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
    async create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
        const userId = req.user.id;
        return this.ticketsService.create(createTicketDto, userId);
    }

    @Get('history')
    @Roles(UserRole.AGENT, UserRole.ADMIN)
    async getHistory() {
        return this.ticketsService.getHistory();
    }

    @Get()
    async findAll(@Request() req) {
        return this.ticketsService.findAll(req.user);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        return this.ticketsService.findOne(id, req.user);
    }

    @Patch(':id/status')
    @Roles(UserRole.AGENT, UserRole.ADMIN)
    async updateStatus(
        @Param('id') id: string,
        @Body() updateDto: UpdateTicketStatusDto,
        @Request() req,
    ) {
        const userId = req.user.id;
        return this.ticketsService.updateStatus(id, updateDto.status, userId);
    }

    @Patch(':id/forward')
    @Roles(UserRole.AGENT, UserRole.ADMIN)
    async forward(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        return this.ticketsService.forwardTicket(id, userId);
    }
}
