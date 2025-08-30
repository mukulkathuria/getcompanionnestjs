// types/payment-method.types.ts

export enum PaymentType {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  UPI = 'UPI',
  WALLET = 'WALLET'
}

export enum BankAccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT'
}

export enum WalletProvider {
  PAYTM = 'PAYTM',
  PHONEPE = 'PHONEPE',
  AMAZON_PAY = 'AMAZON_PAY',
  MOBIKWIK = 'MOBIKWIK',
  FREECHARGE = 'FREECHARGE',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  JIO_MONEY = 'JIO_MONEY'
}

export interface BankAccountInput {
  type: PaymentType.BANK_ACCOUNT;
//   userId: string;
  nickname?: string;
  recipientName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  accountType: BankAccountType;
}

export interface UPIInput {
  type: PaymentType.UPI;
//   userId: string;
  nickname?: string;
  recipientName: string;
  upiId: string;
  upiProvider?: string;
}

export interface WalletInput {
  type: PaymentType.WALLET;
//   userId: string;
  nickname?: string;
  recipientName: string;
  walletProvider: WalletProvider;
  walletIdentifier: string;
}

export type PaymentMethodInput = BankAccountInput | UPIInput | WalletInput;

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: PaymentMethodInput;
}