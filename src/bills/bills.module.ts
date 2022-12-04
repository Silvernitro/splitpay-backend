import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { Bill } from './entities/bill.entity';
import { BillParticipant } from './entities/bill-participant.entity';
import { Claim } from './entities/claim.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, BillParticipant, Claim])],
  controllers: [BillsController],
  providers: [BillsService],
})
export class BillsModule {}
