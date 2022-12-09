import { Controller, Param, Post } from '@nestjs/common';
import { BillParticipantsService } from './bill-participants.service';

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
}
