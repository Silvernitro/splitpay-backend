import Chance from 'chance';
import { Claim } from '../../src/claims/entities/claim.entity';
import { Payment } from '../../src/payments/entities/payment.entity';
const chance = new Chance();

export const mockUserId1 = 'mock_user_id_1';
export const mockUserId2 = 'mock_user_id_2';
export const mockUserId3 = 'mock_user_id_3';
export const mockUserId4 = 'mock_user_id_4';
export const mockUserId5 = 'mock_user_id_5';

export const mockClaimItemName1 = 'mock_claim_item_name_1';
export const mockClaimItemName2 = 'mock_claim_item_name_2';
export const mockClaimItemName3 = 'mock_claim_item_name_3';

export const mockClaimPrice1 = 4.5;
export const mockClaimPrice2 = 6.5;
export const mockClaimPrice3 = 42.83;

export const generateClaim = ({
  billId,
  claimantId,
  itemName,
  price,
}: {
  billId: string;
  claimantId: string;
  itemName: string;
  price: number;
}) => {
  const claim = new Claim();
  claim.billId = billId;
  claim.claimantId = claimantId;
  claim.id = chance.guid();
  claim.itemName = itemName;
  claim.price = price;
  return claim;
};

export const generatePayments = (claim: Claim, debtorIds: string[]) =>
  debtorIds.map((debtorId) => {
    const payment = new Payment();
    payment.billId = claim.billId;
    payment.claim = claim;
    payment.claimId = claim.id;
    payment.id = chance.guid();
    payment.payerId = debtorId;
    return payment;
  });
