import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TicketsService } from '../modules/tickets/tickets.service';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CaslGuard } from '../modules/casl/casl.guard';
import { CheckAbility } from '../modules/casl/check-ability.decorator';
import { UserRole, User } from '../schemas/userSchema/user.schema';
import { Ticket } from '../schemas/ticketSchema/ticket.schema';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, CaslGuard)
export class AdminController {
    constructor(
        private authService: AuthService,
        private ticketsService: TicketsService,
    ) { }

    @Post('add-agent')
    @CheckAbility({ action: 'manage', subject: User })
    async addAgent(
        @Body() data: SignupDto & { sector?: string; supportLevel?: number },
    ) {
        return this.authService.createAgent(data);
    }

    @Get('performance')
    @CheckAbility({ action: 'read', subject: 'all' })
    async getPerformance() {
        return this.ticketsService.getAgentPerformance();
    }
}
