import {
  Headers,
  Body,
  Controller,
  Param,
  Post,
  Get,
  ParseArrayPipe,
} from '@nestjs/common';
import { BillIdParams } from '../utils/params/bill-user-id.params';
import createPaymentDto from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async createPayment(
    @Param() params: BillIdParams,
    @Headers('userId') userId: string,
    @Body(new ParseArrayPipe({ items: createPaymentDto }))
    paymentDtos: createPaymentDto[],
  ) {
    return this.paymentsService.createPayment(
      params.billId,
      userId,
      paymentDtos.map((payment) => payment.claimId),
    );
  }

  @Get('')
  async getPayments(@Param() params: BillIdParams) {
    return this.paymentsService.getPayments(params.billId);
  }
}
