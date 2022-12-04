import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
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
  claimantId: string;

  @ManyToOne('Bill', 'claims')
  bill: Bill;
}
