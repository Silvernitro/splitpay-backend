import {
  Controller,
  Get,
  Param,
  Post,
  NotFoundException,
  Response,
  Body,
  Patch,
} from '@nestjs/common';
import { Response as Res } from 'express';
import { BillIdParams } from 'src/utils/params/bill-user-id.params';
import { BillsService } from './bills.service';
import billParticipantsConfirmationDto from './dto/bill-participants-confirmation.dto';

@Controller()
export class BillsController {
  constructor(private billsService: BillsService) {}

  @Post(':groupId')
  async createBill(@Param('groupId') groupId: string, @Response() res: Res) {
    const createdBill = await this.billsService.createBill(groupId);
    return res.set('Location', `/bills/${createdBill.id}`).json(createdBill);
  }

  @Get(':groupId')
  async getBill(@Param('groupId') groupId: string) {
    const bill = await this.billsService.getOpenBill(groupId);
    if (!bill) {
      throw new NotFoundException('No open bill found for the telegram group.');
    }
    return bill;
  }

  @Patch(':billId/confirmParticipants')
  async setBillParticipantConfirmation(
    @Param() params: BillIdParams,
    @Body() confirmationDto: billParticipantsConfirmationDto,
  ) {
    await this.billsService.setBillParticipantsConfirmation(
      params.billId,
      confirmationDto.participantsConfirmed,
    );

    return 'Bill status succesfully updated.';
  }
}
