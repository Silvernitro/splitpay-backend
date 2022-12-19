import { Controller, Param, Post, Body } from '@nestjs/common';
import { BillParticipantsService } from './bill-participants.service';
import claimConfirmationDto from './dto/claim-confirmation.dto';
import paymentConfirmationDto from './dto/payment-confirmation.dto';
import { BillAndUserIdParams } from '../utils/params/bill-user-id.params';

@Controller()
export class BillParticipantsController {
  constructor(
    private readonly billParticipantsService: BillParticipantsService,
  ) {}

  @Post(':userId')
  async addBillParticipant(@Param() params: BillAndUserIdParams) {
    const id = await this.billParticipantsService.createBillParticipant(
      params.billId,
      params.userId,
    );

    return { message: 'Bill participant successfully created.', data: id };
  }

  @Post(':userId/confirmClaims')
  async setClaimConfirmation(
    @Param() params: BillAndUserIdParams,
    @Body() confirmationDto: claimConfirmationDto,
  ) {
    await this.billParticipantsService.setBillParticipantClaimConfirmation(
      params.billId,
      params.userId,
      confirmationDto.claimsConfirmed,
    );

    return 'Bill participant status succesfully updated.';
  }

  @Post(':userId/confirmPayments')
  async setPaymentConfirmation(
    @Param() params: BillAndUserIdParams,
    @Body() confirmationDto: paymentConfirmationDto,
  ) {
    await this.billParticipantsService.setBillParticipantPaymentConfirmation(
      params.billId,
      params.userId,
      confirmationDto.paymentsConfirmed,
    );

    return 'Bill participant status succesfully updated.';
  }
}
