import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

enum BillStatus {
  PENDING_CLAIMS = 'pending_claims',
  PENDING_PAYMENTS = 'pending_payments',
  PAYMENTS_FINALIZED = 'payments_finalized',
  PAYMENTS_SETTLED = 'payments_settled',
}

@Entity()
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  telegram_group_id: string;

  @Column({
    type: 'enum',
    enum: BillStatus,
    default: BillStatus.PENDING_CLAIMS,
  })
  status: BillStatus;
}
