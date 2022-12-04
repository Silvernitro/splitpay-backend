import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { BillParticipant } from './entities/bill-participant.entity';
import createClaimDto from './dto/create-claim.dto';
import { Claim } from './entities/claim.entity';

@Injectable()
export class BillsService {
  constructor(
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

  async createBillParticipant(bill: Bill, telegramUserId: string) {
    const billParticipant = new BillParticipant();
    billParticipant.telegramUserId = telegramUserId;
    billParticipant.bill = bill;

    return this.billParticipantRepository.upsert(billParticipant, {
      conflictPaths: ['telegramUserId', 'bill'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  async getBillParticipant(billId: string, telegramUserId: string) {
    return this.billParticipantRepository.findOne({
      relations: { bill: true },
      where: { bill: { id: billId }, telegramUserId },
    });
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
