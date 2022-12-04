import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
  ) {}

  async createBill(groupId: string) {
    const bill = new Bill();
    bill.telegram_group_id = groupId;
    return this.billRepository.save(bill);
  }
}
