import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { BillsModule } from './bills/bills.module';
import { BillParticipantsModule } from './bill-participants/bill-participants.module';
import { ClaimsModule } from './claims/claims.module';

import { Bill } from './bills/entities/bill.entity';
import { BillParticipant } from './bill-participants/entities/bill-participant.entity';
import { Claim } from './claims/entities/claim.entity';
import { Payment } from './bills/entities/payment.entity.';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'postgres',
      entities: [Bill, BillParticipant, Claim, Payment],
      synchronize: true,
    }),
    BillsModule,
    BillParticipantsModule,
    ClaimsModule,
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
        ],
      },
    ]),
  ],
})
export class AppModule {
  constructor(private datasource: DataSource) {}
}
