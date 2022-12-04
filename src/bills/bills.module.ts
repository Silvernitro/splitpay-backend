import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { Bill } from './entities/bill.entity';
import { BillParticipant } from './entities/billParticipant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, BillParticipant])],
  controllers: [BillsController],
  providers: [BillsService],
})
export class BillsModule {}
