import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { Bill, BillStatus } from './entities/bill.entity';
import {
  BillParticipant,
  BillParticipantStatus,
} from '../bill-participants/entities/bill-participant.entity';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
  ) {}

  async createBill(telegramGroupId: string) {
    if (await this.doesOpenBillExist(telegramGroupId)) {
      throw new ConflictException(
        'The telegram group already has an open bill.',
      );
    }

    const bill = new Bill();
    bill.telegramGroupId = telegramGroupId;
    return this.billRepository.save(bill);
  }

  async getOpenBill(telegramGroupId: string) {
    return this.billRepository.findOne({
      relations: { claims: {}, payments: {} },
      where: { telegramGroupId, status: Not(BillStatus.PAYMENTS_SETTLED) },
    });
  }

  private async doesOpenBillExist(telegramGroupId: string) {
    return (await this.getOpenBill(telegramGroupId)) !== null;
  }

  async setBillParticipantsConfirmation(billId: string, isConfirmed: boolean) {
    return this.billRepository.update(
      { id: billId },
      {
        status: isConfirmed
          ? BillStatus.PENDING_CLAIMS
          : BillStatus.PENDING_PARTICIPANTS,
      },
    );
  }

  // used in a transaction, therefore an EntityManager should be passed in
  async updateBillStatus(entityManager: EntityManager, billId: string) {
    const bill = await entityManager.findOne(Bill, {
      relations: { participants: true },
      where: { id: billId },
    });
    if (!bill) {
      return null;
    }

    const checkParticipantStatuses = (status: BillParticipantStatus) =>
      bill.participants.every((p: BillParticipant) => p.status === status);

    let newStatus: BillStatus = BillStatus.PENDING_CLAIMS;
    if (checkParticipantStatuses(BillParticipantStatus.PENDING_PAYMENTS)) {
      newStatus = BillStatus.PENDING_PAYMENTS;
    } else if (
      checkParticipantStatuses(BillParticipantStatus.PAYMENTS_FINALIZED)
    ) {
      newStatus = BillStatus.PAYMENTS_FINALIZED;
    } else if (
      checkParticipantStatuses(BillParticipantStatus.PAYMENTS_SETTLED)
    ) {
      newStatus = BillStatus.PAYMENTS_SETTLED;
    }

    return entityManager.update(Bill, { id: billId }, { status: newStatus });
  }
}
