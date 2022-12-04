import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillsModule } from './bills/bills.module';
import { Bill } from './bills/entities/bill.entity';
import { BillParticipant } from './bills/entities/bill-participant.entity';
import { Claim } from './bills/entities/claim.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'postgres',
      entities: [Bill, BillParticipant, Claim],
      synchronize: true,
    }),
    BillsModule,
  ],
})
export class AppModule {
  constructor(private datasource: DataSource) {}
}
