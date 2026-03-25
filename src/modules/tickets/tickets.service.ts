import { Injectable, Logger, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument, TicketStatus } from '../../schemas/ticketSchema/ticket.schema';
import { User, UserDocument, UserRole } from '../../schemas/userSchema/user.schema';
import { Assignment, AssignmentDocument } from '../../schemas/assignmentSchema/assignment.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { MailingService } from '../mailing/mailing.service';

@Injectable()
export class TicketsService {
    private readonly logger = new Logger(TicketsService.name);

    constructor(
        @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Assignment.name) private assignmentModel: Model<AssignmentDocument>,
        private mailingService: MailingService,
    ) { }

    async create(createTicketDto: CreateTicketDto, userId: string): Promise<Ticket> {
        const newTicket = new this.ticketModel({
            ...createTicketDto,
            createdBy: userId,
            status: TicketStatus.NEW,
            history: [
                {
                    action: 'Ticket Created',
                    performedBy: new Types.ObjectId(userId),
                    timestamp: new Date(),
                },
            ],
        });

        const savedTicket = await newTicket.save();
        await this.assignTicket(savedTicket);
        return (await this.ticketModel.findById(savedTicket._id)
            .populate('assignedTo', 'name email')
            .populate('orderId')
            .populate('productId')
            .exec())!;
    }

    async updateStatus(id: string, status: TicketStatus, userId: string): Promise<Ticket> {
        const ticket = await this.ticketModel.findById(id).populate('createdBy', 'name email').exec();
        if (!ticket) throw new NotFoundException('Ticket not found');

        const customer = ticket.createdBy as any;
        const actionMessage = status === TicketStatus.RESOLVED
            ? `Resolved query of ${customer.name} (${customer.email})`
            : `Status updated to ${status}`;

        ticket.status = status;
        ticket.history.push({
            action: actionMessage,
            performedBy: new Types.ObjectId(userId),
            performedOn: status === TicketStatus.RESOLVED ? customer._id : undefined,
            timestamp: new Date(),
        } as any);

        const savedTicket = await ticket.save();

        if (status === TicketStatus.RESOLVED) {
            const customer = ticket.createdBy as any;
            await this.mailingService.sendEmail(
                customer.email,
                `Ticket Resolved: ${ticket.title}`,
                `Hello ${customer.name},\n\nYour ticket "${ticket.title}" has been resolved.\n\nThank you!`,
            );
        }

        return savedTicket as any;
    }

    async forwardTicket(id: string, userId: string): Promise<Ticket> {
        const ticket = await this.ticketModel.findById(id);
        if (!ticket) throw new NotFoundException('Ticket not found');

        if (ticket.level >= 2) {
            throw new BadRequestException('Ticket is already at the maximum support level (L2)');
        }

        const oldLevel = ticket.level;
        ticket.level += 1;
        ticket.status = TicketStatus.FORWARDED;
        (ticket as any).assignedTo = undefined;
        ticket.history.push({
            action: `Failed to resolve at Level ${oldLevel} - Forwarded to Level ${ticket.level}`,
            performedBy: new Types.ObjectId(userId),
            timestamp: new Date(),
        } as any);
 
        const savedTicket = await ticket.save();
        await this.assignTicket(savedTicket);
        return (await this.ticketModel.findById(savedTicket._id)
            .populate('assignedTo', 'name email')
            .populate('orderId')
            .populate('productId')
            .exec())!;
    }

    async getAgentPerformance() {
        return this.ticketModel.aggregate([
            { $match: { status: TicketStatus.RESOLVED } },
            {
                $group: {
                    _id: '$assignedTo',
                    resolvedCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'agent',
                },
            },
            { $unwind: '$agent' },
            {
                $project: {
                    _id: 0,
                    agentId: '$_id',
                    agentName: '$agent.name',
                    agentEmail: '$agent.email',
                    resolvedCount: 1,
                },
            },
        ]);
    }

    private async assignTicket(ticket: TicketDocument) {
        const { sector, level } = ticket;
        const agents = await this.userModel.find({
            role: UserRole.AGENT,
            sector,
            supportLevel: level,
        }).sort({ _id: 1 });

        if (agents.length === 0) {
            this.logger.warn(`No agents found for sector: ${sector}, level: ${level}. Ticket remains NEW or FORWARDED.`);
            return;
        }

        let assignment = await this.assignmentModel.findOne({ sector, level });
        let nextAgentIndex = 0;

        if (assignment) {
            const lastAgentId = assignment.lastAssignedAgentId.toString();
            const lastAgentIndex = agents.findIndex(a => a._id.toString() === lastAgentId);
            nextAgentIndex = (lastAgentIndex + 1) % agents.length;
        }

        const nextAgent = agents[nextAgentIndex];
        ticket.assignedTo = nextAgent._id as any;
        ticket.status = TicketStatus.RECEIVED;
        ticket.history.push({
            action: `Assigned to Agent: ${nextAgent.name} (Round-Robin)`,
            performedBy: nextAgent._id as any,
            timestamp: new Date(),
        } as any);

        await ticket.save();

        if (!assignment) {
            await this.assignmentModel.create({ sector, level, lastAssignedAgentId: nextAgent._id });
        } else {
            assignment.lastAssignedAgentId = nextAgent._id as any;
            await assignment.save();
        }
    }

    async findOne(id: string, user: any): Promise<Ticket> {
        const ticket = await this.ticketModel.findById(id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('orderId')
            .populate('productId')
            .exec();

        if (!ticket) throw new NotFoundException('Ticket not found');

        // RBAC Check
        if (user.role === UserRole.CUSTOMER && ticket.createdBy['_id'].toString() !== user.id) {
            throw new UnauthorizedException('You do not have permission to view this ticket');
        }
        if (user.role === UserRole.AGENT && ticket.assignedTo && ticket.assignedTo['_id'].toString() !== user.id) {
            throw new UnauthorizedException('You do not have permission to view this ticket');
        }

        return ticket;
    }

    async findAll(user: any): Promise<Ticket[]> {
        const query: any = {};

        console.log('FinalAll Request for User:', {
            id: user.id || user._id,
            role: user.role,
        });

        const currentUserId = user.id || user._id;

        if (user.role === UserRole.CUSTOMER) {
            query.createdBy = new Types.ObjectId(currentUserId);
        } else if (user.role === UserRole.AGENT) {
            query.assignedTo = new Types.ObjectId(currentUserId);
        }

        console.log('Mongoose Final Query:', query);

        return this.ticketModel.find(query)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('orderId')
            .populate('productId')
            .exec();
    }
}
