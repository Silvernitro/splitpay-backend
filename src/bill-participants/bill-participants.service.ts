import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  BillParticipant,
  BillParticipantStatus,
} from './entities/bill-participant.entity';
import { BillsService } from '../bills/bills.service';

@Injectable()
export class BillParticipantsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(BillParticipant)
    private billParticipantRepository: Repository<BillParticipant>,
    private billsService: BillsService,
  ) {}

  async createBillParticipant(billId: string, telegramUserId: string) {
    const billParticipant = new BillParticipant();
    billParticipant.telegramUserId = telegramUserId;
    billParticipant.billId = billId;

    const result = await this.billParticipantRepository.upsert(
      billParticipant,
      {
        conflictPaths: ['telegramUserId', 'billId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    return result.identifiers[0];
  }

  async getBillParticipant(billId: string, telegramUserId: string) {
    return this.billParticipantRepository.findOne({
      relations: { bill: true },
      where: { bill: { id: billId }, telegramUserId },
    });
  }

  async setBillParticipantClaimConfirmation(
    billId: string,
    telegramUserId: string,
    isConfirmed: boolean,
  ) {
    const status = isConfirmed
      ? BillParticipantStatus.PENDING_PAYMENTS
      : BillParticipantStatus.PENDING_CLAIMS;
    return this.setBillParticipantStatus(billId, telegramUserId, status);
  }

  async setBillParticipantPaymentConfirmation(
    billId: string,
    telegramUserId: string,
    isConfirmed: boolean,
  ) {
    const status = isConfirmed
      ? BillParticipantStatus.PAYMENTS_FINALIZED
      : BillParticipantStatus.PENDING_PAYMENTS;
    return this.setBillParticipantStatus(billId, telegramUserId, status);
  }

  private async setBillParticipantStatus(
    billId: string,
    telegramUserId: string,
    status: BillParticipantStatus,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        BillParticipant,
        { bill: { id: billId }, telegramUserId },
        {
          status,
        },
      );
      await this.billsService.updateBillStatus(queryRunner.manager, billId);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
