import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PaymentsModule } from 'src/payments/payments.module';
import { ClaimsModule } from 'src/claims/claims.module';
import BillOptimizer from 'src/utils/bill-optimizer';

@Module({
  imports: [PaymentsModule, ClaimsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, BillOptimizer],
})
export class TransactionsModule {}
