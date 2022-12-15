import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BillParticipant } from '../../bill-participants/entities/bill-participant.entity';
import { Bill } from '../../bills/entities/bill.entity';

@Entity()
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemName: string;

  @Column({ type: 'numeric' })
  price: number;

  @ManyToOne('BillParticipant')
  claimant: BillParticipant;

  @Column()
  claimantId: string;

  @ManyToOne('Bill', 'claims')
  bill: Bill;

  @Column()
  billId: string;
}
