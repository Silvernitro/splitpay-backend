import { Controller, Get, Param } from '@nestjs/common';
import { BillIdParams } from 'src/utils/params/bill-user-id.params';
import { TransactionsService } from './transactions.service';

@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(@Param() params: BillIdParams) {
    return this.transactionsService.generateTransactions(params.billId);
  }
}
