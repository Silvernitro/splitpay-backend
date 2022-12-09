import { Headers, Body, Controller, Param, Post } from '@nestjs/common';
import createClaimDto from 'src/claims/dto/create-claim.dto';
import { ClaimsService } from './claims.service';

@Controller()
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  async createClaim(
    @Param('billId') billId: string,
    @Headers('userId') userId: string,
    @Body() claimDto: createClaimDto,
  ) {
    return this.claimsService.createClaim(billId, userId, claimDto);
  }
}
