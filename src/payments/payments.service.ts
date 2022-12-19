import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BillParticipantsService } from 'src/bill-participants/bill-participants.service';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private billParticipantsService: BillParticipantsService,
  ) {}

  async createPayment(
    billId: string,
    telegramUserId: string,
    claimIds: string[],
  ) {
    const payer = await this.billParticipantsService.getBillParticipant(
      billId,
      telegramUserId,
    );
    if (!payer) {
      throw new BadRequestException("User doesn't exist in the given bill.");
    }

    const valuesToInsert = claimIds.map((claimId) => ({
      claimId,
      billId,
      payerId: payer.id,
    }));

    return this.paymentRepository
      .createQueryBuilder()
      .insert()
      .values(valuesToInsert)
      .execute();
  }

  async getPayments(billId: string) {
    return this.paymentRepository.find({
      where: { billId },
      relations: { claim: true },
    });
  }
}
