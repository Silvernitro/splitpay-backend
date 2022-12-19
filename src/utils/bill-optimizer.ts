import { PriorityQueue, ICompare } from '@datastructures-js/priority-queue';
import { Injectable } from '@nestjs/common';
import { Claim } from 'src/claims/entities/claim.entity';
import { Payment } from 'src/payments/entities/payment.entity';

/**
 * {
 *  <userId>: <amount>, ...
 * }
 */
interface IBalance {
  [index: string]: number;
}

interface IBalances {
  creditors: IBalance;
  debtors: IBalance;
}

/**
 * {
 *  <userId-payer>: {
 *    <userId-payee>: <amount>, ...
 *  }, ...
 * }
 */
export interface IOptimizerOutput {
  [index: string]: {
    [index: string]: number;
  };
}

interface IUserAmountPair {
  userId: string;
  amount: number;
}

@Injectable()
export default class BillOptimizer {
  private readonly BALANCE_THRESHOLD = 0.01;

  public optimize(claims: Claim[], payments: Payment[]): IOptimizerOutput {
    const { debtors, creditors } = this.generateBalances(claims, payments);
    return this.optimizeBalances(debtors, creditors);
  }

  /**
   * Given a list of claims and payments for a bill, returns the
   * net balances of the debtors and creditors
   * i.e. how much each debtor owes and how much each creditor is owed
   */
  generateBalances(claims: Claim[], payments: Payment[]): IBalances {
    // for each claim, find out how many ppl are splitting the cost
    const claimCounts = {};
    payments.forEach((payment) => {
      claimCounts[payment.claimId] = (claimCounts[payment.claimId] ?? 0) + 1;
    });

    const balances: { [index: string]: number } = {};
    claims.forEach((claim) => {
      balances[claim.claimantId] =
        (balances[claim.claimantId] ?? 0) +
        // not sure why, but claim.price has a runtime type of string and
        // compile-time type of number, hence the weird type assertions and conversion
        parseFloat(claim.price as unknown as string);
    });

    payments.forEach((payment) => {
      const claim = payment.claim;
      // cost of item / # of people splitting the cost
      const shareToPay = claim.price / (claimCounts[claim.id] ?? 1);
      balances[payment.payerId] = (balances[payment.payerId] ?? 0) - shareToPay;
    });

    const debtors = {};
    const creditors = {};
    Object.entries(balances).forEach(([userId, balance]) => {
      if (balance < 0) {
        debtors[userId] = Math.abs(balance);
      }
      if (balance > 0) {
        creditors[userId] = balance;
      }
    });

    return { debtors, creditors };
  }

  optimizeBalances(debtors: IBalance, creditors: IBalance): IOptimizerOutput {
    const transactions: IOptimizerOutput = {};
    const debtorsHeap = new PriorityQueue<IUserAmountPair>(
      this.userAmountPairComparator,
    );
    const creditorsHeap = new PriorityQueue<IUserAmountPair>(
      this.userAmountPairComparator,
    );

    // Initialize heaps
    Object.entries(debtors).forEach(([userId, amount]) =>
      debtorsHeap.enqueue({ userId, amount }),
    );
    Object.entries(creditors).forEach(([userId, amount]) =>
      creditorsHeap.enqueue({ userId, amount }),
    );

    // Run them greedy approx. algorithm - ain't nobody got time for an NP-complete problem!
    while (!debtorsHeap.isEmpty() && !creditorsHeap.isEmpty()) {
      const payer = debtorsHeap.dequeue(); // user who owes the most money
      const payee = creditorsHeap.dequeue(); // user who is owed the most money

      // the payer pays the max amount possible to the payee
      const transactionAmount = Math.min(payer.amount, payee.amount);
      if (!(payer.userId in transactions)) {
        transactions[payer.userId] = {};
      }
      transactions[payer.userId][payee.userId] = transactionAmount;

      // add the users back to their respective queues if their balances still aren't settled
      payer.amount -= transactionAmount;
      payee.amount -= transactionAmount;
      if (payer.amount > 0) {
        debtorsHeap.enqueue(payer);
      }
      if (payee.amount > 0) {
        creditorsHeap.enqueue(payee);
      }
    }

    if (!this.checkBalanceThresholds(debtorsHeap, creditorsHeap)) {
      throw new Error(
        `Invalid claims and payments: claims and payments do not match up.
        There are either outstanding claims or payments.`,
      );
    }

    return transactions;
  }

  private userAmountPairComparator: ICompare<IUserAmountPair> = (
    a: IUserAmountPair,
    b: IUserAmountPair,
  ) => {
    if (a.amount > b.amount) {
      // pair with larger amount gets higher priority
      return -1;
    }
    if (a.amount < b.amount) {
      return 1;
    }
    // if amount is the same, compare the user ids to obtain a deterministic ordering,
    // otherwise the priority queue will arbitrarily order pairs with the same amount.
    return a.userId < b.userId ? -1 : 1;
  };

  /**
   * Due to rounding errors, users don't always end up with $0 in their balances.
   * E.g. splitting $10 amongst 3 people yields rounding inaccuracies
   * As such, we don't always end up with empty heaps by the end of the algorithm.
   * In this case, we should check that all the remaining balances are valid.
   */
  private checkBalanceThresholds = (
    debtorsHeap: PriorityQueue<IUserAmountPair>,
    creditorsHeap: PriorityQueue<IUserAmountPair>,
  ): boolean => {
    const debtorBalances = debtorsHeap.toArray();
    const creditorBalances = creditorsHeap.toArray();
    const predicate = (balance: IUserAmountPair) =>
      balance.amount < this.BALANCE_THRESHOLD;

    // note that this still evaluates to true if both arrays are empty
    return debtorBalances.every(predicate) && creditorBalances.every(predicate);
  };
}
