import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Bill, BillStatus } from './entities/bill.entity';
import {
  BillParticipant,
  BillParticipantStatus,
} from '../bill-participants/entities/bill-participant.entity';
import createClaimDto from './dto/create-claim.dto';
import { Claim } from './entities/claim.entity';
import { Payment } from './entities/payment.entity.';

@Injectable()
export class BillsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(BillParticipant)
    private billParticipantRepository: Repository<BillParticipant>,
    @InjectRepository(Claim)
    private claimRepository: Repository<Claim>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createBill(telegramGroupId: string) {
    const bill = new Bill();
    bill.telegramGroupId = telegramGroupId;
    return this.billRepository.save(bill);
  }

  async getBill(telegramGroupId: string) {
    return this.billRepository.findOne({
      relations: { claims: { claimant: true } },
      where: { telegramGroupId },
    });
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

  private async updateBillStatus(entityManager: EntityManager, billId: string) {
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

  async setBillParticipantStatus(
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
      await this.updateBillStatus(queryRunner.manager, billId);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createClaim(
    bill: Bill,
    billParticipant: BillParticipant,
    claimDto: createClaimDto,
  ) {
    const claim = new Claim();
    claim.bill = bill;
    claim.claimant = billParticipant;
    claim.itemName = claimDto.itemName;
    claim.price = claimDto.price;

    return this.claimRepository.save(claim);
  }

  async createPayment(billId: string, telegramUserId: string, claimId: string) {
    const payer = await this.getBillParticipant(billId, telegramUserId);
    if (!payer) {
      throw new BadRequestException("User doesn't exist in the given bill.");
    }

    const payment = new Payment();
    payment.billId = billId;
    payment.payerId = payer.id;
    payment.claimId = claimId;

    return this.paymentRepository.save(payment);
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
}
