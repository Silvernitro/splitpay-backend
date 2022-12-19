import { Injectable } from '@nestjs/common';
import { ClaimsService } from 'src/claims/claims.service';
import { PaymentsService } from 'src/payments/payments.service';
import BillOptimizer from 'src/utils/bill-optimizer';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly claimsService: ClaimsService,
    private readonly paymentsService: PaymentsService,
    private readonly billOptimizer: BillOptimizer,
  ) {}

  async generateTransactions(billId: string) {
    const claims = await this.claimsService.getClaims(billId);
    const payments = await this.paymentsService.getPayments(billId);

    return this.billOptimizer.optimize(claims, payments);
  }
}
