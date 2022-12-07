import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
// import types to prevent circular dependency
import type { BillParticipant } from './bill-participant.entity';
import type { Claim } from './claim.entity';
import { Payment } from './payment.entity.';

// definitely wished TS supported enum inheritance...
// most fields here are the same as BillParticipantStatus
export enum BillStatus {
  PENDING_PARTICIPANTS = 'pending_participants',
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
  telegramGroupId: string;

  @Column({
    type: 'enum',
    enum: BillStatus,
    default: BillStatus.PENDING_PARTICIPANTS,
  })
  status: BillStatus;

  @OneToMany('BillParticipant', 'bill')
  participants: BillParticipant[];

  @OneToMany('Claim', 'bill')
  claims: Claim[];

  @OneToMany('Payment', 'bill')
  payments: Payment[];
}
