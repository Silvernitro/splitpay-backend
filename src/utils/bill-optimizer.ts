import {
  MaxPriorityQueue,
  IGetCompareValue,
} from '@datastructures-js/priority-queue';

/**
 * {
 *  <userId>: <amount>, ...
 * }
 */
interface IOptimizerInput {
  [index: string]: number;
}

/**
 * {
 *  <userId-payer>: {
 *    <userId-payee>: <amount>, ...
 *  }, ...
 * }
 */
interface IOptimizerOutput {
  [index: string]: {
    [index: string]: number;
  };
}

interface IUserAmountPair {
  userId: string;
  amount: number;
}

const getAmount: IGetCompareValue<IUserAmountPair> = (pair) => pair.amount;

const optimizer = (
  claims: IOptimizerInput, // how much each user needs to receive
  payments: IOptimizerInput, // how much each user needs to pay
): IOptimizerOutput => {
  const transactions: IOptimizerOutput = {};
  const paymentsHeap = new MaxPriorityQueue<IUserAmountPair>(getAmount);
  const claimsHeap = new MaxPriorityQueue<IUserAmountPair>(getAmount);

  // Initialize heaps
  Object.entries(payments).forEach(([userId, amount]) =>
    paymentsHeap.enqueue({ userId, amount }),
  );
  Object.entries(claims).forEach(([userId, amount]) =>
    claimsHeap.enqueue({ userId, amount }),
  );

  while (!paymentsHeap.isEmpty() && !claimsHeap.isEmpty()) {
    const payer = paymentsHeap.dequeue(); // user who owes the most money
    const payee = claimsHeap.dequeue(); // user who is owed the most money

    // the payer pays the max amount possible to the payee
    const transactionAmount = Math.min(payer.amount, payee.amount);
    if (!(payer.userId in transactions)) {
      transactions[payer.userId] = {};
    }
    transactions[payer.userId][payee.userId] = transactionAmount;

    // add the users back to their respective queues if their balances still aren't settled
    payer.amount -= transactionAmount;
    payee.amount -= transactionAmount;
    if (payer.amount !== 0) {
      paymentsHeap.enqueue(payer);
    }
    if (payee.amount !== 0) {
      claimsHeap.enqueue(payee);
    }
  }

  return transactions;
};

export default optimizer;
