import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillParticipant } from 'src/bill-participants/entities/bill-participant.entity';

@Injectable()
export class BillParticipantsService {
  constructor(
    @InjectRepository(BillParticipant)
    private billParticipantRepository: Repository<BillParticipant>,
  ) {}

  async createBillParticipant(billId: string, telegramUserId: string) {
    const billParticipant = new BillParticipant();
    billParticipant.telegramUserId = telegramUserId;
    billParticipant.billId = billId;

    return this.billParticipantRepository.upsert(billParticipant, {
      conflictPaths: ['telegramUserId', 'billId'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  async getBillParticipant(billId: string, telegramUserId: string) {
    return this.billParticipantRepository.findOne({
      relations: { bill: true },
      where: { bill: { id: billId }, telegramUserId },
    });
  }
}
