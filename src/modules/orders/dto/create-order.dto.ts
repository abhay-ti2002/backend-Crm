export class CreateOrderDto {
  items: string[];
  totalAmount: number;
  discount?: number;
  finalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
}
