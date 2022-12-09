import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Bill } from '../../bills/entities/bill.entity';

export enum BillParticipantStatus {
  PENDING_CLAIMS = 'pending_claims',
  PENDING_PAYMENTS = 'pending_payments',
  PAYMENTS_FINALIZED = 'payments_finalized',
  PAYMENTS_SETTLED = 'payments_settled',
}

@Entity()
@Unique(['telegramUserId', 'bill'])
export class BillParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  telegramUserId: string;

  @ManyToOne('Bill', 'participants')
  bill: Bill;

  // companion field for the actual bill navigation field
  @Column()
  billId: string;

  @Column({
    type: 'enum',
    enum: BillParticipantStatus,
    default: BillParticipantStatus.PENDING_CLAIMS,
  })
  status: BillParticipantStatus;
}
