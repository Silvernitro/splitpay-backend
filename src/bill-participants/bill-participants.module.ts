import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillParticipantsService } from './bill-participants.service';
import { BillParticipantsController } from './bill-participants.controller';
import { BillParticipant } from 'src/bill-participants/entities/bill-participant.entity';
import { BillsModule } from 'src/bills/bills.module';

@Module({
  imports: [TypeOrmModule.forFeature([BillParticipant]), BillsModule],
  controllers: [BillParticipantsController],
  providers: [BillParticipantsService],
  exports: [BillParticipantsService],
})
export class BillParticipantsModule {}
