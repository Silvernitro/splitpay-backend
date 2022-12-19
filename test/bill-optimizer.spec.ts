import Chance from 'chance';
import BillOptimizer from '../src/utils/bill-optimizer';
import {
  generateClaim,
  generatePayments,
  mockClaimItemName1,
  mockClaimItemName2,
  mockClaimItemName3,
  mockClaimPrice1,
  mockClaimPrice2,
  mockClaimPrice3,
  mockUserId1,
  mockUserId2,
  mockUserId3,
  mockUserId4,
  mockUserId5,
} from './utils';

const chance = new Chance();

describe('bill-optimizer', () => {
  let billOptimizer: BillOptimizer;

  beforeAll(() => {
    billOptimizer = new BillOptimizer();
  });

  describe('generate balances', () => {
    describe('No net transactions', () => {
      it('single user owes himself', () => {
        const mockBillId = chance.guid();
        const claim = generateClaim({
          billId: mockBillId,
          claimantId: mockUserId1,
          itemName: mockClaimItemName1,
          price: mockClaimPrice1,
        });
        const payments = generatePayments(claim, [mockUserId1]);

        const { debtors, creditors } = billOptimizer.generateBalances(
          [claim],
          payments,
        );

        expect(Object.entries(debtors)).toHaveLength(0);
        expect(Object.entries(creditors)).toHaveLength(0);
      });

      it('2 users owe each other the same amount', () => {
        const mockBillId = chance.guid();

        const claim1 = generateClaim({
          billId: mockBillId,
          claimantId: mockUserId1,
          itemName: mockClaimItemName1,
          price: mockClaimPrice1,
        });
        const claim2 = generateClaim({
          billId: mockBillId,
          claimantId: mockUserId2,
          itemName: mockClaimItemName2,
          price: mockClaimPrice1,
        });
        const payments = [
          ...generatePayments(claim1, [mockUserId2]),
          ...generatePayments(claim2, [mockUserId1]),
        ];

        const { debtors, creditors } = billOptimizer.generateBalances(
          [claim1, claim2],
          payments,
        );

        expect(Object.entries(debtors)).toHaveLength(0);
        expect(Object.entries(creditors)).toHaveLength(0);
      });

      it('3 users owe the same amount in a cycle', () => {
        const mockBillId = chance.guid();

        const claim1 = generateClaim({
          billId: mockBillId,
          claimantId: mockUserId1,
          itemName: mockClaimItemName1,
          price: mockClaimPrice1,
        });
        const claim2 = generateClaim({
          billId: mockBillId,
          claimantId: mockUserId2,
          itemName: mockClaimItemName2,
          price: mockClaimPrice1,
        });
        const claim3 = generateClaim({
          billId: mockBillId,
          claimantId: mockUserId3,
          itemName: mockClaimItemName3,
          price: mockClaimPrice1,
        });
        const payments = [
          ...generatePayments(claim1, [mockUserId3]),
          ...generatePayments(claim2, [mockUserId1]),
          ...generatePayments(claim3, [mockUserId2]),
        ];

        const { debtors, creditors } = billOptimizer.generateBalances(
          [claim1, claim2, claim3],
          payments,
        );

        expect(Object.entries(debtors)).toHaveLength(0);
        expect(Object.entries(creditors)).toHaveLength(0);
      });
    });
    it('transitivity: user1 owes user2; user2 owes user3', () => {
      /**
       * user1 -($4.50)-> user2 -($4.50)-> user3
       */
      const mockBillId = chance.guid();

      const claim1 = generateClaim({
        billId: mockBillId,
        claimantId: mockUserId2,
        itemName: mockClaimItemName1,
        price: mockClaimPrice1,
      });
      const claim2 = generateClaim({
        billId: mockBillId,
        claimantId: mockUserId3,
        itemName: mockClaimItemName2,
        price: mockClaimPrice1,
      });
      const payments = [
        ...generatePayments(claim1, [mockUserId1]),
        ...generatePayments(claim2, [mockUserId2]),
      ];

      const { debtors, creditors } = billOptimizer.generateBalances(
        [claim1, claim2],
        payments,
      );

      expect(Object.entries(debtors)).toHaveLength(1);
      expect(Object.entries(creditors)).toHaveLength(1);

      const expectedDebtors = {
        [mockUserId1]: mockClaimPrice1,
      };
      const expectedCreditors = {
        [mockUserId3]: mockClaimPrice1,
      };

      expect(debtors).toEqual(expectedDebtors);
      expect(creditors).toEqual(expectedCreditors);
    });

    it('1 claim; multiple payments; creditor owes himself', () => {
      const mockBillId = chance.guid();

      const claim1 = generateClaim({
        billId: mockBillId,
        claimantId: mockUserId1,
        itemName: mockClaimItemName1,
        price: mockClaimPrice1,
      });
      const payments = [
        ...generatePayments(claim1, [mockUserId1, mockUserId2]),
      ];

      const { debtors, creditors } = billOptimizer.generateBalances(
        [claim1],
        payments,
      );

      expect(Object.entries(debtors)).toHaveLength(1);
      expect(Object.entries(creditors)).toHaveLength(1);

      const expectedDebtors = {
        [mockUserId2]: mockClaimPrice1 / 2,
      };
      const expectedCreditors = {
        [mockUserId1]: mockClaimPrice1 / 2,
      };

      expect(debtors).toEqual(expectedDebtors);
      expect(creditors).toEqual(expectedCreditors);
    });

    it('1 claim, multiple payments from other users', () => {
      const mockBillId = chance.guid();

      const claim1 = generateClaim({
        billId: mockBillId,
        claimantId: mockUserId1,
        itemName: mockClaimItemName1,
        price: mockClaimPrice1,
      });
      const payments = [
        ...generatePayments(claim1, [mockUserId2, mockUserId3]),
      ];

      const { debtors, creditors } = billOptimizer.generateBalances(
        [claim1],
        payments,
      );

      expect(Object.entries(debtors)).toHaveLength(2);
      expect(Object.entries(creditors)).toHaveLength(1);

      const expectedDebtors = {
        [mockUserId2]: mockClaimPrice1 / 2,
        [mockUserId3]: mockClaimPrice1 / 2,
      };
      const expectedCreditors = {
        [mockUserId1]: mockClaimPrice1,
      };

      expect(debtors).toEqual(expectedDebtors);
      expect(creditors).toEqual(expectedCreditors);
    });

    it('1 user owes multiple people', () => {
      const mockBillId = chance.guid();

      const claim1 = generateClaim({
        billId: mockBillId,
        claimantId: mockUserId1,
        itemName: mockClaimItemName1,
        price: mockClaimPrice1,
      });
      const claim2 = generateClaim({
        billId: mockBillId,
        claimantId: mockUserId2,
        itemName: mockClaimItemName2,
        price: mockClaimPrice2,
      });
      const payments = [
        ...generatePayments(claim1, [mockUserId3]),
        ...generatePayments(claim2, [mockUserId3]),
      ];

      const { debtors, creditors } = billOptimizer.generateBalances(
        [claim1, claim2],
        payments,
      );

      expect(Object.entries(debtors)).toHaveLength(1);
      expect(Object.entries(creditors)).toHaveLength(2);

      const expectedDebtors = {
        [mockUserId3]: mockClaimPrice1 + mockClaimPrice2,
      };
      const expectedCreditors = {
        [mockUserId1]: mockClaimPrice1,
        [mockUserId2]: mockClaimPrice2,
      };

      expect(debtors).toEqual(expectedDebtors);
      expect(creditors).toEqual(expectedCreditors);
    });

    it('user both owes and is owed money; user owes more than he/she is owed', () => {
      const mockBillId = chance.guid();

      const claim1 = generateClaim({
        billId: mockBillId,
        claimantId: mockUserId1,
        itemName: mockClaimItemName1,
        price: mockClaimPrice3,
      });
      const claim2 = generateClaim({
        billId: mockBillId,
        claimantId: mockUserId2,
        itemName: mockClaimItemName2,
        price: mockClaimPrice2,
      });
      const claim3 = generateClaim({
        billId: mockBillId,
        claimantId: mockUserId3,
        itemName: mockClaimItemName3,
        price: mockClaimPrice1,
      });
      const payments = [
        ...generatePayments(claim1, [mockUserId3]),
        ...generatePayments(claim2, [mockUserId3]),
        ...generatePayments(claim3, [mockUserId4, mockUserId5]),
      ];

      const { debtors, creditors } = billOptimizer.generateBalances(
        [claim1, claim2, claim3],
        payments,
      );

      expect(Object.entries(debtors)).toHaveLength(3);
      expect(Object.entries(creditors)).toHaveLength(2);

      const expectedDebtors = {
        [mockUserId3]: mockClaimPrice3 + mockClaimPrice2 - mockClaimPrice1,
        [mockUserId4]: mockClaimPrice1 / 2,
        [mockUserId5]: mockClaimPrice1 / 2,
      };
      const expectedCreditors = {
        [mockUserId1]: mockClaimPrice3,
        [mockUserId2]: mockClaimPrice2,
      };

      expect(debtors).toEqual(expectedDebtors);
      expect(creditors).toEqual(expectedCreditors);
    });

    it('user both owes and is owed money; user owes less than he/she is owed', () => {
      const mockBillId = chance.guid();

      const claim1 = generateClaim({
        billId: mockBillId,
        claimantId: mockUserId1,
        itemName: mockClaimItemName1,
        price: mockClaimPrice1,
      });
      const claim2 = generateClaim({
        billId: mockBillId,
        claimantId: mockUserId2,
        itemName: mockClaimItemName2,
        price: mockClaimPrice2,
      });
      const claim3 = generateClaim({
        billId: mockBillId,
        claimantId: mockUserId3,
        itemName: mockClaimItemName3,
        price: mockClaimPrice3,
      });
      const payments = [
        ...generatePayments(claim1, [mockUserId3]),
        ...generatePayments(claim2, [mockUserId3]),
        ...generatePayments(claim3, [mockUserId4, mockUserId5]),
      ];

      const { debtors, creditors } = billOptimizer.generateBalances(
        [claim1, claim2, claim3],
        payments,
      );

      expect(Object.entries(debtors)).toHaveLength(2);
      expect(Object.entries(creditors)).toHaveLength(3);

      const expectedDebtors = {
        [mockUserId4]: mockClaimPrice3 / 2,
        [mockUserId5]: mockClaimPrice3 / 2,
      };
      const expectedCreditors = {
        [mockUserId1]: mockClaimPrice1,
        [mockUserId2]: mockClaimPrice2,
        [mockUserId3]: mockClaimPrice3 - (mockClaimPrice1 + mockClaimPrice2),
      };

      expect(debtors).toEqual(expectedDebtors);
      expect(creditors).toEqual(expectedCreditors);
    });
  });

  describe('optimize balances', () => {
    it('Empty inputs', () => {
      const transactions = billOptimizer.optimizeBalances({}, {});
      expect(Object.entries(transactions)).toHaveLength(0);
    });

    it('Outstanding claims should throw error', () => {
      expect(() =>
        billOptimizer.optimizeBalances({ [mockUserId1]: 10 }, {}),
      ).toThrow();
    });

    it('Outstanding payments should throw error', () => {
      expect(() =>
        billOptimizer.optimizeBalances({}, { [mockUserId1]: 10 }),
      ).toThrow();
    });

    it('Single user owes 1 user', () => {
      const debtors = {
        [mockUserId1]: mockClaimPrice1,
      };
      const creditors = {
        [mockUserId2]: mockClaimPrice1,
      };
      const expectedTransactions = {
        [mockUserId1]: {
          [mockUserId2]: mockClaimPrice1,
        },
      };

      const transactions = billOptimizer.optimizeBalances(debtors, creditors);
      expect(transactions).toEqual(expectedTransactions);
    });

    it('Single user multiple users', () => {
      const debtors = {
        [mockUserId1]: mockClaimPrice1 + mockClaimPrice2 + mockClaimPrice3,
      };
      const creditors = {
        [mockUserId2]: mockClaimPrice1,
        [mockUserId3]: mockClaimPrice2,
        [mockUserId4]: mockClaimPrice3,
      };
      const expectedTransactions = {
        [mockUserId1]: {
          [mockUserId2]: mockClaimPrice1,
          [mockUserId3]: mockClaimPrice2,
          [mockUserId4]: mockClaimPrice3,
        },
      };

      const transactions = billOptimizer.optimizeBalances(debtors, creditors);
      expect(transactions).toEqual(expectedTransactions);
    });

    it('multiple users owe multiple users', () => {
      const debtors = {
        [mockUserId4]: mockClaimPrice3 / 2,
        [mockUserId5]: mockClaimPrice3 / 2,
      };
      const user3Balance =
        mockClaimPrice3 - (mockClaimPrice1 + mockClaimPrice2);
      const creditors = {
        [mockUserId1]: mockClaimPrice1,
        [mockUserId2]: mockClaimPrice2,
        [mockUserId3]: user3Balance,
      };
      const expectedTransactions = {
        [mockUserId4]: {
          [mockUserId3]: mockClaimPrice3 / 2,
        },
        [mockUserId5]: {
          [mockUserId1]: mockClaimPrice1,
          [mockUserId2]: mockClaimPrice2,
          [mockUserId3]: user3Balance - mockClaimPrice3 / 2,
        },
      };

      const transactions = billOptimizer.optimizeBalances(debtors, creditors);
      expect(transactions).toEqual(expectedTransactions);
    });

    it('multiple users owe multiple users 2', () => {
      const debtors = {
        [mockUserId3]: mockClaimPrice1 / 2 + mockClaimPrice2 / 3,
        [mockUserId4]: mockClaimPrice1 / 2 + mockClaimPrice2 / 3,
      };
      const creditors = {
        [mockUserId1]: mockClaimPrice1 - mockClaimPrice2 / 3,
        [mockUserId2]: mockClaimPrice2,
      };
      const expectedTransactions = {
        [mockUserId3]: {
          [mockUserId2]: mockClaimPrice1 / 2 + mockClaimPrice2 / 3,
        },
        [mockUserId4]: {
          [mockUserId1]: mockClaimPrice1 - mockClaimPrice2 / 3,
          [mockUserId2]:
            mockClaimPrice1 / 2 +
            mockClaimPrice2 / 3 -
            (mockClaimPrice1 - mockClaimPrice2 / 3),
        },
      };

      const transactions = billOptimizer.optimizeBalances(debtors, creditors);
      expect(transactions).toEqual(expectedTransactions);
    });
  });
});
