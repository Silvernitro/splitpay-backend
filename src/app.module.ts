import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USERNAME'),
        password: configService.get<string>('POSTGRES_PW'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [Bill, BillParticipant, Claim, Payment],
        synchronize: true,
        // logging: true,
      }),
      inject: [ConfigService],
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
