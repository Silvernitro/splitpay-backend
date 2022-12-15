import { Headers, Body, Controller, Param, Post, Get } from '@nestjs/common';
import createClaimDto from 'src/claims/dto/create-claim.dto';
import { BillIdParams } from 'src/utils/params/bill-user-id.params';
import { ClaimsService } from './claims.service';

@Controller()
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  async createClaim(
    @Param() params: BillIdParams,
    @Headers('userId') userId: string,
    @Body() claimDto: createClaimDto,
  ) {
    return this.claimsService.createClaim(params.billId, userId, claimDto);
  }

  @Get()
  async getClaims(@Param() params: BillIdParams) {
    return this.claimsService.getClaims(params.billId);
  }
}
