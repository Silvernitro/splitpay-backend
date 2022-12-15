import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BillParticipantsService } from 'src/bill-participants/bill-participants.service';
import createClaimDto from 'src/claims/dto/create-claim.dto';
import { Claim } from 'src/claims/entities/claim.entity';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim)
    private claimRepository: Repository<Claim>,
    private billParticipantsService: BillParticipantsService,
  ) {}

  async createClaim(
    billId: string,
    telegramUserId: string,
    claimDto: createClaimDto,
  ) {
    const billParticipant =
      await this.billParticipantsService.getBillParticipant(
        billId,
        telegramUserId,
      );
    if (!billParticipant) {
      throw new BadRequestException("User doesn't exist in the given bill.");
    }

    const claim = new Claim();
    claim.billId = billId;
    claim.claimant = billParticipant;
    claim.itemName = claimDto.itemName;
    claim.price = claimDto.price;

    return this.claimRepository.save(claim);
  }

  async getClaims(billId: string) {
    return this.claimRepository.find({
      where: { billId },
    });
  }
}
