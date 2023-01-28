import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { BillsModule } from './bills/bills.module';
import { BillParticipantsModule } from './bill-participants/bill-participants.module';
import { ClaimsModule } from './claims/claims.module';
import { PaymentsModule } from './payments/payments.module';
import { TransactionsModule } from './transactions/transactions.module';
import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { DbsModule } from './dbs/dbs.module';
import { TelegramModule } from './telegram/telegram.module';

import { Bill } from './bills/entities/bill.entity';
import { BillParticipant } from './bill-participants/entities/bill-participant.entity';
import { Claim } from './claims/entities/claim.entity';
import { Payment } from './payments/entities/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'postgres',
      entities: [Bill, BillParticipant, Claim, Payment],
      synchronize: true,
      // logging: true,
    }),
    HealthcheckModule,
    BillsModule,
    BillParticipantsModule,
    ClaimsModule,
    PaymentsModule,
    TransactionsModule,
    DbsModule,
    TelegramModule,
    RouterModule.register([
      {
        path: 'bills',
        module: BillsModule,
        children: [
          {
            path: ':billId/participants',
            module: BillParticipantsModule,
          },
          {
            path: ':billId/claims',
            module: ClaimsModule,
          },
          {
            path: ':billId/payments',
            module: PaymentsModule,
          },
          {
            path: ':billId/transactions',
            module: TransactionsModule,
          },
        ],
      },
    ]),
  ],
})
export class AppModule {
  constructor(private datasource: DataSource) {}
}
