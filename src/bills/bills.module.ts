import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { Bill } from './entities/bill.entity';
import { BillParticipant } from './entities/bill-participant.entity';
import { Claim } from './entities/claim.entity';
import { Payment } from './entities/payment.entity.';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, BillParticipant, Claim, Payment])],
  controllers: [BillsController],
  providers: [BillsService],
})
export class BillsModule {}
