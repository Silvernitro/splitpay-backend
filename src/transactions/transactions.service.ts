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

    const toCollect = {};
    claims.forEach((claim) => {
      toCollect[claim.claimantId] =
        (toCollect[claim.claimantId] ?? (0 as number)) +
        // not sure why, but claim.price has a runtime type of string and
        // compile-time type of number, hence the weird type assertions and conversion
        parseFloat(claim.price as unknown as string);
    });

    const claimCounts = {};
    payments.forEach((payment) => {
      claimCounts[payment.claimId] = (claimCounts[payment.claimId] ?? 0) + 1;
    });

    const toPay = {};
    payments.forEach((payment) => {
      const claim = payment.claim;
      // cost of item / # of people splitting the cost
      const shareToPay = claim.price / claimCounts[claim.id];
      toPay[payment.payerId] = (toPay[payment.payerId] ?? 0) + shareToPay;
    });

    return this.billOptimizer.optimize(toCollect, toPay);
  }
}
