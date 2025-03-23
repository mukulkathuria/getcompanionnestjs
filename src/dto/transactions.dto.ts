import { Transactions } from '@prisma/client';
import { errorDto } from './common.dto';

export enum TransactionStatusEnum {
  COMPLETED = 'COMPLETED',
  UNDERPROCESSED = 'UNDERPROCESSED',
  REFUNDED = 'REFUNDED',
  DECLINED = 'DECLINED',
}

export enum PaymentmethodEnum {
  UPI = 'UPI',
  DC = 'DEBITCARD',
  CC = 'CREDITCARD',
  WALLET = 'WALLET',
  NB = 'NETBANKING',
  EMI = 'EMI',
  BNPL = 'BNPL',
  NEFTRTGS = 'NEFTRTGS',
  QR = 'QR',
}

export enum CardTypeEnum {
  VISA = 'VISA',
  MAST = 'Mastercard',
  AMEX = 'AMEX',
  SMAE = 'SBI Maestro',
  MAES = 'Maestro',
  DINR = 'Diners',
  JCB = 'JCB',
  RUPAY = 'Rupay',
  RUPAYCC = 'Rupay Credit Card',
}

export enum UPIBanksEnum {
  'Amazon Pay' = 'Amazon Pay',
  BHIM = 'BHIM',
  'BHIM BOI UPI' = 'BHIM BOI UPI',
  'BHIM Canara' = 'BHIM Canara',
  'BHIM DLB UPI' = 'BHIM DLB UPI',
  'BHIM Indus Pay' = 'BHIM Indus Pay',
  'BHIM PNB' = 'BHIM PNB',
  'BHIM SBI Pay' = 'BHIM SBI Pay',
  'DBS Digibank App' = 'DBS Digibank App',
  Fampay = 'Fampay',
  'Google Pay' = 'Google Pay',
  Groww = 'Groww',
  'ICICI iMobile' = 'ICICI iMobile',
  Jupiter = 'Jupiter',
  Mobikwik = 'Mobikwik',
  'MyJio UPI' = 'MyJio UPI',
  OkCredit = 'OkCredit',
  Paytm = 'Paytm',
  PayZapp = 'PayZapp',
  PhonePe = 'PhonePe',
  Slash = 'Slash',
  Slice = 'Slice',
  TataNeu = 'TataNeu',
  Zomoto = 'Zomoto',
}

export enum WalletBankEnum {
  PAYTM = 'PayTM',
  FREC = 'Freecharge',
  AMZPAY = 'Amazon Pay',
  AMON = 'Airtel Money',
  OXYCASH = 'Oxigen',
  OLAM = 'Ola Money',
  JIOM = 'Jio Money',
  ITZC = 'ItzCash',
  PAYZP = 'HDFC PayZapp',
  YESW = 'Yes Bank',
  mobikwik = 'MobiKwik',
  PHONEPE = 'PhonePe',
}

export enum NetBankingNamesEnum {
  AIRNB = 'Airtel Payments Bank',
  AUSFNB = 'AU Small Finance Bank',
  AUSFCNB = 'AU Small Finance Bank - Corporate',
  AXIB = 'AXIS Bank',
  AXISCNB = 'Axis Corporate Netbanking',
  BBRB = 'Bank of Baroda',
  BOIB = 'Bank of India',
  BOMB = 'Bank of Maharashtra',
  CABB = 'Canara Bank',
  SYNDB = 'Canara Bank (Erstwhile - Syndicate Bank)',
  CSFBC = 'Capital Small Finance Bank Corporate',
  CSFBR = 'Capital Small Finance Bank Retail',
  CSBN = 'Catholic Syrian Bank',
  CBIB = 'Central Bank Of India',
  CUBB = 'City Union Bank',
  CSMSNB = 'Cosmos Bank',
  DCBB = 'DCB Bank',
  DSHB = 'Deutsche Bank',
  DLNBCORP = 'Dhanlaxmi Bank - Corporate',
  DLSB = 'Dhanlaxmi Bank - Retail',
  FEDB = 'Federal Bank',
  FEDCORP = 'Federal Bank Corporate',
  HDFB = 'HDFC Bank',
  HDFCCONB = 'HDFC Bank - Corporate Banking',
  ICIB = 'ICICI Bank',
  ICICICNB = 'ICICI Corporate Netbanking',
  IDBB = 'IDBI Bank',
  IDBICORP = 'IDBI Corp Netbanking',
  IDFCNB = 'IDFC FIRST Bank',
  INDB = 'Indian Bank',
  ALLB = 'Indian Bank (Erstwhile Allahabad Bank)',
  INOB = 'Indian Overseas Bank',
  INIB = 'IndusInd Bank',
  JAKB = 'Jammu & Kashmir Bank',
  JANANB = 'Jana Small Finance Bank',
  JSBNB = 'Janata Sahakari Bank Pune',
  KRKB = 'Karnataka Bank',
  KRVBC = 'Karur Vysya - Corporate Banking',
  KRVB = 'Karur Vysya Bank',
  '162B' = 'Kotak Mahindra Bank',
  KTKBCORP = 'Kotak Mahindra Bank - Corp Net Banking',
  KVBNBTPV = 'KVB NB TPV',
  PAYTMNB = 'Paytm Payments Bank',
  OBCB = 'PNB (Erstwhile -Oriental Bank of Commerce)',
  UNIB = 'PNB (Erstwhile-United Bank of India)',
  INDPOST = 'Post Office Savings Bank (POSB)',
  PMEC = 'Prime Co Op Bank Ltd',
  PSBNB = 'Punjab & Sind Bank',
  PNBB = 'Punjab National Bank',
  CPNB = 'Punjab National Bank - Corporate Banking',
  RBLNB = 'RBL Bank',
  RBLCNB = 'RBL Corporate Netbanking',
  SRSWT = 'Saraswat Bank',
  SHIVANB = 'Shivalik Small Finance Bank',
  SOIB = 'South Indian Bank',
  SCBNB = 'Standard Chartered Bank',
  SBIB = 'State Bank of India',
  SBNCORP = 'State Bank of India (Corporate)',
  SVCNB = 'SVC Co-operative Bank Ltd.',
  TMBB = 'Tamilnad Mercantile Bank',
  UCOB = 'UCO Bank',
  UCOCNB = 'UCO Corporate',
  UBIB = 'Union Bank of India',
  ADBB = 'Union Bank of India (Erstwhile Andhra Bank)',
  CRPB = 'Union Bank of India (Erstwhile Corporation Bank)',
  UBIBC = 'Union Bank OLT - Corporate Banking',
  YESB = 'Yes Bank',
}

export interface payUTransactionDetailsDto {
  PG_TYPE?: string;
  addedon?: string;
  amount: string;
  bank_ref_num?: string;
  bankcode?: string;
  cardCategory?: string;
  cardnum?: string;
  city?: string;
  country?: string;
  discount?: string;
  email?: string;
  error?: string;
  error_Message?: string;
  firstname?: string;
  hash?: string;
  key?: string;
  lastname?: string;
  mode: string;
  net_amount_debit: string;
  pa_name?: string;
  payment_source?: string;
  phone?: string;
  productinfo?: string;
  state: string;
  status?: string;
  txnid: string;
  undefinedmihpayid?: string;
  vpa?: string;
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: string;
  field5?: string;
  field6?: string;
  field7?: string;
  field8?: string;
  field9?: string;
  unmappedstatus?: string;
}

export interface BookingTransactionReturnDto extends errorDto {
  data?: Transactions[];
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

export interface paymentdetailsDto {
  [key: string]: any;
  paymentId: string;
  paymentMethod: PaymentmethodEnum;
  cardType?: CardTypeEnum;
  cardNumber?: string;
  cardCategory?: string;
  bankDetails?: string;
  UPIid?: string;
  UPIBank?: string;
  walletBank?: WalletBankEnum;
  netBanking?: NetBankingNamesEnum;
}
