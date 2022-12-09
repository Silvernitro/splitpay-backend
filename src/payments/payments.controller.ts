import { Headers, Body, Controller, Param, Post } from '@nestjs/common';
import createPaymentDto from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async createPayment(
    @Param('billId') billId: string,
    @Headers('userId') userId: string,
    @Body() paymentDto: createPaymentDto,
  ) {
    return this.paymentsService.createPayment(
      billId,
      userId,
      paymentDto.claimId,
    );
  }
}
