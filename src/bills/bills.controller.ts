import {
  Controller,
  Get,
  Param,
  Post,
  Headers,
  NotFoundException,
  Response,
  Body,
  Put,
} from '@nestjs/common';
import { Response as Res } from 'express';
import { BillsService } from './bills.service';
import createClaimDto from './dto/create-claim.dto';
import claimConfirmationDto from './dto/claim-confirmation.dto';

@Controller('bills')
export class BillsController {
  constructor(private billsService: BillsService) {}

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
  async getBill(
    @Param('groupId') groupId: string,
    @Headers('userId') userId: string,
  ) {
    const bill = await this.billsService.getBill(groupId);
    if (!bill) {
      throw new NotFoundException('No open bill found for telegram group.');
    }

    // wrong logic. what if only 1 guy opens the web app and is done submitting
    // claims? then the app will only have 1 participant and move on to next state
    await this.billsService.createBillParticipant(bill, userId);
    return bill;
  }

  @Post(':billId/claims')
  async createClaim(
    @Param('billId') billId: string,
    @Headers('userId') userId: string,
    @Body() claimDto: createClaimDto,
  ) {
    const billParticipant = await this.billsService.getBillParticipant(
      billId,
      userId,
    );
    const bill = billParticipant.bill;

    return this.billsService.createClaim(bill, billParticipant, claimDto);
  }

  @Put(':billId/participants/claimConfirmation')
  async setClaimConfirmation(
    @Param('billId') billId: string,
    @Headers('userId') userId: string,
    @Body() confirmationDto: claimConfirmationDto,
  ) {
    return this.billsService.setBillParticipantClaimConfirmation(
      billId,
      userId,
      confirmationDto.claimsConfirmed,
    );
  }
}
