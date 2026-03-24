import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TicketsService } from '../modules/tickets/tickets.service';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../schemas/userSchema/user.schema';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(
        private authService: AuthService,
        private ticketsService: TicketsService,
    ) { }

    @Post('add-agent')
    async addAgent(
        @Body() data: SignupDto & { sector?: string; supportLevel?: number },
    ) {
        return this.authService.createAgent(data);
    }

    @Get('performance')
    async getPerformance() {
        return this.ticketsService.getAgentPerformance();
    }
}
