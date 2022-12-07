import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { BillParticipant } from './bill-participant.entity';
import { Bill } from './bill.entity';
import { Claim } from './claim.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('BillParticipant')
  payer: BillParticipant;

  @Column()
  payerId: string;

  @ManyToOne('Claim')
  claim: Claim;

  @Column()
  claimId: string;

  @ManyToOne('Bill', 'payments')
  bill: Bill;

  @Column()
  billId: string;
}
