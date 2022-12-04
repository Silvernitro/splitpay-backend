import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BillParticipant } from './bill-participant.entity';
import { Bill } from './bill.entity';

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

  @ManyToOne('Bill', 'claims')
  bill: Bill;
}
