import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TicketsService } from './tickets.service';
import { Ticket } from '../../schemas/ticketSchema/ticket.schema';

describe('TicketsService', () => {
    let service: TicketsService;
    let model: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TicketsService,
                {
                    provide: getModelToken(Ticket.name),
                    useValue: {
                        new: jest.fn().mockImplementation((doc) => ({
                            ...doc,
                            save: jest.fn().mockResolvedValue(doc),
                        })),
                        constructor: jest.fn().mockImplementation((doc) => ({
                            ...doc,
                            save: jest.fn().mockResolvedValue(doc),
                        })),
                        find: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<TicketsService>(TicketsService);
        model = module.get(getModelToken(Ticket.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a new ticket', async () => {
        const createTicketDto = {
            title: 'Test Ticket',
            description: 'Test Description',
            sector: 'IT',
        };
        const userId = '67e1a2b3c4d5e6f7a8b9c0d1';

        // Mocking the model constructor since it's used with 'new this.ticketModel'
        const saveSpy = jest.fn().mockResolvedValue({ _id: 'ticketId', ...createTicketDto, createdBy: userId });
        jest.spyOn(model, 'constructor' as any).mockImplementation(() => ({
            save: saveSpy
        }));

        // In NestJS Mongoose, new this.ticketModel(data) returns an instance.
        // The service uses: const newTicket = new this.ticketModel({...});

        // We need to mock the constructor properly for the service.
        // However, the service uses `new this.ticketModel`, which is hard to mock in Jest without a real class or prototype.
        // A better way is to use a mock that returns an object with save.

        // Let's refine the mock in the service or here.
    });
});
