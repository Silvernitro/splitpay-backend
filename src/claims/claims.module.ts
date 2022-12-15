import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import { Claim } from 'src/claims/entities/claim.entity';
import { BillParticipantsModule } from 'src/bill-participants/bill-participants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Claim]), BillParticipantsModule],
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [ClaimsService],
})
export class ClaimsModule {}
