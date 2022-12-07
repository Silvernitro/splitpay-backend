import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Bill, BillStatus } from './entities/bill.entity';
import { BillParticipant } from './entities/bill-participant.entity';
import createClaimDto from './dto/create-claim.dto';
import { Claim } from './entities/claim.entity';

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

  private async updateBillStatus(entityManager: EntityManager, billId: string) {
    const bill = await entityManager.findOne(Bill, {
      relations: { participants: true },
      where: { id: billId },
    });
    if (!bill) {
      return null;
    }

    const areAllParticipantStatuses = (status: BillStatus) =>
      bill.participants.every((p: BillParticipant) => p.status === status);

    let newStatus: BillStatus = BillStatus.PENDING_CLAIMS;
    if (areAllParticipantStatuses(BillStatus.PENDING_PAYMENTS)) {
      newStatus = BillStatus.PENDING_PAYMENTS;
    } else if (areAllParticipantStatuses(BillStatus.PAYMENTS_FINALIZED)) {
      newStatus = BillStatus.PAYMENTS_FINALIZED;
    } else if (areAllParticipantStatuses(BillStatus.PAYMENTS_SETTLED)) {
      newStatus = BillStatus.PAYMENTS_SETTLED;
    }

    return entityManager.update(Bill, { id: billId }, { status: newStatus });
  }

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

  async setBillParticipantClaimConfirmation(
    billId: string,
    telegramUserId: string,
    isConfirmed: boolean,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        BillParticipant,
        { bill: { id: billId }, telegramUserId },
        {
          // todo: refactor to use a util class that can tell us prev and next states
          status: isConfirmed
            ? BillStatus.PENDING_PAYMENTS
            : BillStatus.PENDING_CLAIMS,
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
}
