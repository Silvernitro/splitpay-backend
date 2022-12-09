import { Controller, Param, Post, Body } from '@nestjs/common';
import { BillParticipantsService } from './bill-participants.service';
import claimConfirmationDto from './dto/claim-confirmation.dto';
import paymentConfirmationDto from './dto/payment-confirmation.dto';

@Controller()
export class BillParticipantsController {
  constructor(
    private readonly billParticipantsService: BillParticipantsService,
  ) {}

  @Post(':userId')
  async addBillParticipant(
    @Param('billId') billId: string,
    @Param('userId') telegramUserId: string,
  ) {
    await this.billParticipantsService.createBillParticipant(
      billId,
      telegramUserId,
    );
    return 'Bill participant successfully created';
  }

  @Post(':userId/confirmClaims')
  async setClaimConfirmation(
    @Param('billId') billId: string,
    @Param('userId') userId: string,
    @Body() confirmationDto: claimConfirmationDto,
  ) {
    await this.billParticipantsService.setBillParticipantClaimConfirmation(
      billId,
      userId,
      confirmationDto.claimsConfirmed,
    );

    return 'Bill participant status succesfully updated.';
  }

  @Post(':userId/confirmPayments')
  async setPaymentConfirmation(
    @Param('billId') billId: string,
    @Param('userId') userId: string,
    @Body() confirmationDto: paymentConfirmationDto,
  ) {
    await this.billParticipantsService.setBillParticipantPaymentConfirmation(
      billId,
      userId,
      confirmationDto.paymentsConfirmed,
    );

    return 'Bill participant status succesfully updated.';
  }
}
