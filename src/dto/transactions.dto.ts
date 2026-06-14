import { TransactionLedger } from '@prisma/client';
import { errorDto } from './common.dto';

export enum TransactionStatusEnum {
  COMPLETED = 'COMPLETED',
  UNDERPROCESSED = 'UNDERPROCESSED',
  REFUNDED = 'REFUNDED',
  DECLINED = 'DECLINED',
}

/**
 * Razorpay payment method codes.
 * Reference: https://razorpay.com/docs/payments/payment-methods/
 */
export enum PaymentmethodEnum {
  UPI = 'upi',
  DC = 'card', // debit card — differentiated via card.type in payload
  // CC = 'card',           // credit card — differentiated via card.type in payload
  WALLET = 'wallet',
  NB = 'netbanking',
  EMI = 'emi',
  BNPL = 'paylater',
  NEFTRTGS = 'bank_transfer',
  // QR = 'upi',            // QR-based UPI
}

/**
 * Razorpay card network codes.
 * Reference: https://razorpay.com/docs/payments/payment-methods/cards/
 */
export enum CardTypeEnum {
  VISA = 'Visa',
  MAST = 'MasterCard',
  AMEX = 'American Express',
  MAES = 'Maestro',
  DINR = 'Diners Club',
  JCB = 'JCB',
  RUPAY = 'RuPay',
  RUPAYCC = 'RuPay Credit Card',
  UNKNOWN = 'Unknown',
}

/**
 * Razorpay UPI app identifiers surfaced in vpa / method metadata.
 */
export enum UPIBanksEnum {
  'Amazon Pay' = 'Amazon Pay',
  BHIM = 'BHIM',
  'Google Pay' = 'Google Pay',
  Groww = 'Groww',
  Mobikwik = 'Mobikwik',
  Paytm = 'Paytm',
  PhonePe = 'PhonePe',
  Slice = 'Slice',
  TataNeu = 'TataNeu',
  Jupiter = 'Jupiter',
  Fampay = 'Fampay',
}

/**
 * Razorpay wallet provider codes.
 * Reference: https://razorpay.com/docs/payments/payment-methods/wallets/
 */
export enum WalletBankEnum {
  PAYTM = 'paytm',
  FREECHARGE = 'freecharge',
  AMAZONPAY = 'amazonpay',
  AIRTELMONEY = 'airtelmoney',
  JIOMONEY = 'jiomoney',
  PHONEPE = 'phonepe',
  OLAMONEY = 'olamoney',
  MOBIKWIK = 'mobikwik',
}

/**
 * Razorpay net-banking bank codes.
 * Reference: https://razorpay.com/docs/payments/payment-methods/netbanking/
 */
export enum NetBankingNamesEnum {
  HDFC = 'HDFC Bank',
  ICIC = 'ICICI Bank',
  SBIN = 'State Bank of India',
  UTIB = 'Axis Bank',
  PUNB = 'Punjab National Bank',
  BARB = 'Bank of Baroda',
  BKID = 'Bank of India',
  CNRB = 'Canara Bank',
  IOBA = 'Indian Overseas Bank',
  INDB = 'IndusInd Bank',
  FDRL = 'Federal Bank',
  YESB = 'Yes Bank',
  KVBL = 'Karur Vysya Bank',
  AUBL = 'AU Small Finance Bank',
  IDFB = 'IDFC FIRST Bank',
  KKBK = 'Kotak Mahindra Bank',
  RATN = 'RBL Bank',
  DCBL = 'DCB Bank',
  SIBL = 'South Indian Bank',
  CITI = 'Citibank',
  SCBL = 'Standard Chartered Bank',
  UBIN = 'Union Bank of India',
  IDIB = 'Indian Bank',
  UCBA = 'UCO Bank',
  MAHB = 'Bank of Maharashtra',
  PSIB = 'Punjab & Sind Bank',
  JAKA = 'Jammu & Kashmir Bank',
  TMBL = 'Tamilnad Mercantile Bank',
  COSB = 'Cosmos Bank',
  JSBL = 'Janata Sahakari Bank',
}

// ---------------------------------------------------------------------------
// Razorpay-specific DTOs
// ---------------------------------------------------------------------------

/**
 * Payload sent to our server after the Razorpay checkout is completed.
 * The client receives these three fields from Razorpay's handler callback.
 */
export interface RazorpayVerifyPaymentDto {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  /** Internal transaction id stored in the Razorpay order receipt. */
  txnid: string;
}

/**
 * Shape of the payment object returned by Razorpay's Payments API.
 * Only the fields we actually use are typed here; the rest are covered by the
 * index signature so unexpected fields don't cause TS errors.
 */
export interface RazorpayPaymentDetailsDto {
  [key: string]: unknown;
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string; // 'card' | 'netbanking' | 'wallet' | 'upi' | 'emi' | 'paylater'
  amount_refunded: number;
  captured: boolean;
  email: string;
  contact: string;
  created_at: number; // UNIX timestamp
  // Card fields (present when method === 'card')
  card?: {
    id: string;
    name: string;
    network: string; // 'Visa' | 'MasterCard' | 'RuPay' etc.
    type: string; // 'credit' | 'debit'
    issuer: string;
    international: boolean;
    emi: boolean;
    last4: string;
  };
  // Net-banking fields
  bank?: string; // bank code e.g. 'HDFC'
  // Wallet fields
  wallet?: string; // wallet name e.g. 'paytm'
  // UPI fields
  vpa?: string; // virtual payment address
  // EMI fields
  emi?: boolean;
  emi_months?: number;
  error_code?: string;
  error_description?: string;
}

/**
 * What we send back to the client after creating a Razorpay order.
 * The client uses orderId + keyId to open the Razorpay checkout.
 */
export interface RazorpayOrderResponseDto {
  orderId: string;
  amount: number; // in paise
  currency: string;
  receipt: string; // our internal txnId
  keyId: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Shared / common DTOs (unchanged public contracts)
// ---------------------------------------------------------------------------

export interface BookingTransactionReturnDto extends errorDto {
  data?: TransactionLedger[];
}

export interface getHashInputDto {
  firstname: string;
  email: string;
  amount: string;
  productinfo: string;
}

export interface initiatePaymentInputDto extends getHashInputDto {
  phone: string;
  surl: string;
  furl: string;
  bookingId: number;
}

/**
 * Normalised payment details stored in the `metadata` column of
 * `TransactionLedger`.  Derived from `RazorpayPaymentDetailsDto` by
 * `makePaymentdetailsjson` in transactions.utils.ts.
 */
export interface paymentdetailsDto {
  [key: string]: unknown;
  paymentId: string;
  paymentMethod: string;
  cardType?: CardTypeEnum;
  cardNumber?: string;
  cardCategory?: string;
  bankDetails?: string;
  UPIid?: string;
  UPIBank?: string;
  walletBank?: WalletBankEnum;
  netBanking?: NetBankingNamesEnum;
}
