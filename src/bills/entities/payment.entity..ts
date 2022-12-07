import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BillParticipant } from './bill-participant.entity';
import { Bill } from './bill.entity';
import { Claim } from './claim.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('BillParticipant')
  payer: BillParticipant;

  @ManyToOne('Claim')
  claim: Claim;

  @ManyToOne('Bill', 'payments')
  bill: Bill;
}
