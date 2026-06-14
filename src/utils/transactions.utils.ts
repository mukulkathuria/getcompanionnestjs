import { errorMsgDto } from 'src/dto/common.dto';
import {
  CardTypeEnum,
  NetBankingNamesEnum,
  paymentdetailsDto,
  RazorpayPaymentDetailsDto,
  WalletBankEnum,
} from 'src/dto/transactions.dto';
import { UPIBanksData } from 'src/validations/data/transaction.validationdata';

interface RazorpayPaymentDetailsJsonReturnDto {
  data?: paymentdetailsDto;
  error?: errorMsgDto;
}

/**
 * Resolves the UPI app name from a virtual payment address (VPA).
 * Looks up each entry in UPIBanksData — which maps app names to
 * comma-separated VPA handle substrings — and returns the first match.
 */
const resolveUPIBank = (vpa: string): string | undefined => {
  if (!vpa) return undefined;
  const upibankKeys = Object.keys(UPIBanksData);
  for (const key of upibankKeys) {
    const handles = UPIBanksData[key].split(',').map((h: string) => h.trim());
    if (handles.some((handle: string) => vpa.includes(handle))) {
      return key;
    }
  }
  return undefined;
};

/**
 * Maps a raw Razorpay payment object to the normalised `paymentdetailsDto`
 * shape that is stored in `TransactionLedger.metadata`.
 *
 * Razorpay method values:
 *   'card' | 'netbanking' | 'wallet' | 'upi' | 'emi' | 'paylater' | 'bank_transfer'
 */
export const makePaymentdetailsjson = (
  razorpayPayment: RazorpayPaymentDetailsDto,
): RazorpayPaymentDetailsJsonReturnDto => {
  if (!razorpayPayment) {
    return { error: { status: 422, message: 'Payment details are missing' } };
  }

  const method = razorpayPayment.method;
  const methodDetails: Partial<paymentdetailsDto> = {};

  switch (method) {
    case 'card': {
      const card = razorpayPayment.card;
      if (card) {
        // Normalise network name against our enum; fall back to UNKNOWN
        const networkKey = Object.keys(CardTypeEnum).find(
          (k) =>
            CardTypeEnum[k as keyof typeof CardTypeEnum].toLowerCase() ===
            card.network?.toLowerCase(),
        );
        methodDetails.cardType = networkKey
          ? CardTypeEnum[networkKey as keyof typeof CardTypeEnum]
          : CardTypeEnum.UNKNOWN;

        // Store only last 4 digits — never the full PAN
        methodDetails.cardNumber = card.last4 ? `****${card.last4}` : undefined;
        // 'credit' | 'debit' — maps to our CardTypeEnum concept of "category"
        methodDetails.cardCategory = card.type;
      }
      break;
    }

    case 'wallet': {
      const walletCode = razorpayPayment.wallet;
      if (walletCode) {
        const walletKey = Object.keys(WalletBankEnum).find(
          (k) =>
            WalletBankEnum[k as keyof typeof WalletBankEnum].toLowerCase() ===
            walletCode.toLowerCase(),
        );
        methodDetails.walletBank = walletKey
          ? WalletBankEnum[walletKey as keyof typeof WalletBankEnum]
          : undefined;
      }
      break;
    }

    case 'upi': {
      const vpa = razorpayPayment.vpa;
      methodDetails.UPIid = vpa;
      methodDetails.UPIBank = resolveUPIBank(vpa);
      break;
    }

    case 'netbanking': {
      const bankCode = razorpayPayment.bank;
      if (bankCode) {
        const nbKey = Object.keys(NetBankingNamesEnum).find(
          (k) => k === bankCode,
        );
        const resolvedBank = nbKey
          ? NetBankingNamesEnum[nbKey as keyof typeof NetBankingNamesEnum]
          : bankCode; // fall back to the raw code if not in our enum
        methodDetails.bankDetails = resolvedBank;
        methodDetails.netBanking = resolvedBank as NetBankingNamesEnum;
      }
      break;
    }

    // emi, paylater, bank_transfer — no extra fields to map currently
    default:
      break;
  }

  const data: paymentdetailsDto = {
    paymentId: razorpayPayment.id,
    paymentMethod: method,
    ...methodDetails,
  };

  return { data };
};
