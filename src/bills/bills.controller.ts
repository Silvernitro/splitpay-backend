import {
  Controller,
  Get,
  Param,
  Post,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { BillsService } from './bills.service';

@Controller('bills')
export class BillsController {
  constructor(private billsService: BillsService) {}

  @Get()
  async getAllBills() {
    return 'Hello world';
  }

  @Post(':groupId')
  async createBill(@Param('groupId') groupId: string) {
    return this.billsService.createBill(groupId);
  }

  @Get(':groupId')
  async getBill(
    @Param('groupId') groupId: string,
    @Headers('userId') userId: string,
  ) {
    const bill = await this.billsService.getBill(groupId);
    if (!bill) {
      throw new NotFoundException('No open bill found for telegram group.');
    }

    await this.billsService.createBillParticipant(bill, userId);
    return bill;
  }
}
