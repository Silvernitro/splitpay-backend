import { Controller, Get, Param, Post } from '@nestjs/common';
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
}
