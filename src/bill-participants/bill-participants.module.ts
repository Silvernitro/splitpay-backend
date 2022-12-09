import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillParticipantsService } from './bill-participants.service';
import { BillParticipantsController } from './bill-participants.controller';
import { BillParticipant } from 'src/bill-participants/entities/bill-participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillParticipant])],
  controllers: [BillParticipantsController],
  providers: [BillParticipantsService],
  exports: [BillParticipantsService],
})
export class BillParticipantsModule {}
