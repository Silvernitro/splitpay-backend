import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { BillParticipant } from './entities/billParticipant.entity';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(BillParticipant)
    private billParticipantRepository: Repository<BillParticipant>,
  ) {}

  async createBill(telegramGroupId: string) {
    const bill = new Bill();
    bill.telegramGroupId = telegramGroupId;
    return this.billRepository.save(bill);
  }

  async getBill(telegramGroupId: string) {
    return this.billRepository.findOne({
      where: { telegramGroupId },
    });
  }

  async createBillParticipant(bill: Bill, telegramUserId: string) {
    const billParticipant = new BillParticipant();
    billParticipant.telegramUserId = telegramUserId;
    billParticipant.bill = bill;

    return this.billParticipantRepository.upsert(billParticipant, {
      conflictPaths: ['telegramUserId', 'bill'],
      skipUpdateIfNoValuesChanged: true,
    });
  }
}
