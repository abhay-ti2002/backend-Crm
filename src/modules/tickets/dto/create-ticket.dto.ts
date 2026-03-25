export class CreateTicketDto {
    title: string;
    description: string;
    sector: string;
    orderId?: string;
    productId?: string;
}
