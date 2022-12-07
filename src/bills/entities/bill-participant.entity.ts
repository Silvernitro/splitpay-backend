import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Bill, BillStatus } from './bill.entity';

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
    enum: BillStatus,
    default: BillStatus.PENDING_CLAIMS,
  })
  status: BillStatus;
}
