import {
  Controller,
  Get,
  Param,
  Post,
  Headers,
  NotFoundException,
  Response,
  Body,
  Patch,
} from '@nestjs/common';
import { Response as Res } from 'express';
import { BillsService } from './bills.service';
import claimConfirmationDto from './dto/claim-confirmation.dto';
import billParticipantsConfirmationDto from './dto/bill-participants-confirmation.dto';
import paymentConfirmationDto from './dto/payment-confirmation.dto';

@Controller()
export class BillsController {
  constructor(private billsService: BillsService) {}

  // ------------- BILLS ----------- //
  @Get()
  async getAllBills() {
    return 'Hello world';
  }

  @Post(':groupId')
  async createBill(@Param('groupId') groupId: string, @Response() res: Res) {
    const createdBill = await this.billsService.createBill(groupId);
    return res.set('Location', `/bills/${createdBill.id}`).json(createdBill);
  }

  @Get(':groupId')
  async getBill(@Param('groupId') groupId: string) {
    const bill = await this.billsService.getBill(groupId);
    if (!bill) {
      throw new NotFoundException('No open bill found for telegram group.');
    }
    return bill;
  }

  @Patch(':billId/confirmParticipants')
  async setBillParticipantConfirmation(
    @Param('billId') billId: string,
    @Body() confirmationDto: billParticipantsConfirmationDto,
  ) {
    await this.billsService.setBillParticipantsConfirmation(
      billId,
      confirmationDto.participantsConfirmed,
    );

    return 'Bill status succesfully updated.';
  }

  @Patch(':billId/participants/confirmClaims')
  async setClaimConfirmation(
    @Param('billId') billId: string,
    @Headers('userId') userId: string,
    @Body() confirmationDto: claimConfirmationDto,
  ) {
    await this.billsService.setBillParticipantClaimConfirmation(
      billId,
      userId,
      confirmationDto.claimsConfirmed,
    );

    return 'Bill participant status succesfully updated.';
  }

  // ------------- PAYMENTS ----------- //
  @Patch(':billId/participants/confirmPayments')
  async setPaymentConfirmation(
    @Param('billId') billId: string,
    @Headers('userId') userId: string,
    @Body() confirmationDto: paymentConfirmationDto,
  ) {
    await this.billsService.setBillParticipantPaymentConfirmation(
      billId,
      userId,
      confirmationDto.paymentsConfirmed,
    );

    return 'Bill participant status succesfully updated.';
  }
}
