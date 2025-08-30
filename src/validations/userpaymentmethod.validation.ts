import { PrismaClient } from '@prisma/client';
import {
  PaymentMethodInput,
  PaymentType,
  BankAccountType,
  WalletProvider,
  ValidationError,
  ValidationResult,
  BankAccountInput,
  UPIInput,
  WalletInput,
} from '../dto/userpaymentmethod.dto';

export class PaymentMethodValidator {
  private static readonly PATTERNS = {
    IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    UPI_ID: /^[\w.-]+@[\w.-]+$/,
    PHONE: /^[6-9]\d{9}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ACCOUNT_NUMBER: /^\d{9,18}$/,
    NAME: /^[a-zA-Z\s]+$/,
    CUID: /^c[a-z0-9]{24}$/,
  };
  static validate(input: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!input || typeof input !== 'object') {
      errors.push({ field: 'input', message: 'Invalid input provided' });
      return { isValid: false, errors };
    }
    this.validateCommonFields(input, errors);

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    switch (input.type) {
      case PaymentType.BANK_ACCOUNT:
        this.validateBankAccount(input as BankAccountInput, errors);
        break;
      case PaymentType.UPI:
        this.validateUPI(input as UPIInput, errors);
        break;
      case PaymentType.WALLET:
        this.validateWallet(input as WalletInput, errors);
        break;
      default:
        errors.push({
          field: 'type',
          message: 'Invalid payment type. Must be BANK_ACCOUNT, UPI, or WALLET',
        });
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? (input as PaymentMethodInput) : undefined,
    };
  }

  private static validateCommonFields(
    input: any,
    errors: ValidationError[],
  ): void {
    if (!input.userId) {
      errors.push({ field: 'userId', message: 'User ID is required' });
    } else if (typeof input.userId !== 'string') {
      errors.push({ field: 'userId', message: 'User ID must be a string' });
    } else if (!this.PATTERNS.CUID.test(input.userId)) {
      errors.push({ field: 'userId', message: 'Invalid user ID format' });
    }
    if (!input.type) {
      errors.push({ field: 'type', message: 'Payment type is required' });
    } else if (!Object.values(PaymentType).includes(input.type)) {
      errors.push({
        field: 'type',
        message: `Payment type must be one of: ${Object.values(PaymentType).join(', ')}`,
      });
    }

    if (!input.userName) {
      errors.push({
        field: 'userName',
        message: 'User name is required',
      });
    } else if (typeof input.userName !== 'string') {
      errors.push({
        field: 'userName',
        message: 'User name must be a string',
      });
    } else if (
      input.userName.length < 2 ||
      input.userName.length > 100
    ) {
      errors.push({
        field: 'userName',
        message: 'User name must be between 2 and 100 characters',
      });
    } else if (!this.PATTERNS.NAME.test(input.userName)) {
      errors.push({
        field: 'userName',
        message: 'User name can only contain letters and spaces',
      });
    }

    if (input.nickname !== undefined && input.nickname !== null) {
      if (typeof input.nickname !== 'string') {
        errors.push({
          field: 'nickname',
          message: 'Nickname must be a string',
        });
      } else if (input.nickname.length > 50) {
        errors.push({
          field: 'nickname',
          message: 'Nickname must not exceed 50 characters',
        });
      }
    }
  }

  private static validateBankAccount(
    input: BankAccountInput,
    errors: ValidationError[],
  ): void {
    if (!input.accountHolderName) {
      errors.push({
        field: 'accountHolderName',
        message: 'Account holder name is required',
      });
    } else if (typeof input.accountHolderName !== 'string') {
      errors.push({
        field: 'accountHolderName',
        message: 'Account holder name must be a string',
      });
    } else if (
      input.accountHolderName.length < 2 ||
      input.accountHolderName.length > 100
    ) {
      errors.push({
        field: 'accountHolderName',
        message: 'Account holder name must be between 2 and 100 characters',
      });
    } else if (!this.PATTERNS.NAME.test(input.accountHolderName)) {
      errors.push({
        field: 'accountHolderName',
        message: 'Account holder name can only contain letters and spaces',
      });
    }

    if (!input.accountNumber) {
      errors.push({
        field: 'accountNumber',
        message: 'Account number is required',
      });
    } else if (typeof input.accountNumber !== 'string') {
      errors.push({
        field: 'accountNumber',
        message: 'Account number must be a string',
      });
    } else if (!this.PATTERNS.ACCOUNT_NUMBER.test(input.accountNumber)) {
      errors.push({
        field: 'accountNumber',
        message: 'Account number must be between 9 and 18 digits',
      });
    }

    if (!input.ifscCode) {
      errors.push({ field: 'ifscCode', message: 'IFSC code is required' });
    } else if (typeof input.ifscCode !== 'string') {
      errors.push({ field: 'ifscCode', message: 'IFSC code must be a string' });
    } else if (!this.PATTERNS.IFSC.test(input.ifscCode)) {
      errors.push({
        field: 'ifscCode',
        message: 'Invalid IFSC code format (e.g., ABCD0123456)',
      });
    }

    if (!input.bankName) {
      errors.push({ field: 'bankName', message: 'Bank name is required' });
    } else if (typeof input.bankName !== 'string') {
      errors.push({ field: 'bankName', message: 'Bank name must be a string' });
    } else if (input.bankName.length < 2 || input.bankName.length > 100) {
      errors.push({
        field: 'bankName',
        message: 'Bank name must be between 2 and 100 characters',
      });
    }

    if (input.branchName !== undefined && input.branchName !== null) {
      if (typeof input.branchName !== 'string') {
        errors.push({
          field: 'branchName',
          message: 'Branch name must be a string',
        });
      } else if (input.branchName.length < 2 || input.branchName.length > 100) {
        errors.push({
          field: 'branchName',
          message: 'Branch name must be between 2 and 100 characters',
        });
      }
    }

    if (!input.accountType) {
      errors.push({
        field: 'accountType',
        message: 'Account type is required',
      });
    } else if (!Object.values(BankAccountType).includes(input.accountType)) {
      errors.push({
        field: 'accountType',
        message: 'Account type must be either SAVINGS or CURRENT',
      });
    }
  }

  private static validateUPI(input: UPIInput, errors: ValidationError[]): void {
    if (!input.upiId) {
      errors.push({ field: 'upiId', message: 'UPI ID is required' });
    } else if (typeof input.upiId !== 'string') {
      errors.push({ field: 'upiId', message: 'UPI ID must be a string' });
    } else if (!this.PATTERNS.UPI_ID.test(input.upiId)) {
      errors.push({
        field: 'upiId',
        message: 'Invalid UPI ID format (e.g., name@paytm or 9876543210@ybl)',
      });
    } else {
      const provider = input.upiId.split('@')[1];
      const validProviders = [
        'paytm',
        'ybl',
        'okhdfcbank',
        'okicici',
        'oksbi',
        'apl',
        'phonepe',
        'gpay',
      ];
      if (!validProviders.includes(provider)) {
        errors.push({
          field: 'upiId',
          message: `UPI provider '${provider}' is not supported`,
        });
      }
    }

    if (input.upiProvider !== undefined && input.upiProvider !== null) {
      if (typeof input.upiProvider !== 'string') {
        errors.push({
          field: 'upiProvider',
          message: 'UPI provider must be a string',
        });
      } else if (
        input.upiProvider.length < 2 ||
        input.upiProvider.length > 50
      ) {
        errors.push({
          field: 'upiProvider',
          message: 'UPI provider must be between 2 and 50 characters',
        });
      }
    }
  }

  private static validateWallet(
    input: WalletInput,
    errors: ValidationError[],
  ): void {
    if (!input.walletProvider) {
      errors.push({
        field: 'walletProvider',
        message: 'Wallet provider is required',
      });
    } else if (!Object.values(WalletProvider).includes(input.walletProvider)) {
      errors.push({
        field: 'walletProvider',
        message: `Wallet provider must be one of: ${Object.values(WalletProvider).join(', ')}`,
      });
    }

    if (!input.walletIdentifier) {
      errors.push({
        field: 'walletIdentifier',
        message: 'Wallet identifier is required',
      });
    } else if (typeof input.walletIdentifier !== 'string') {
      errors.push({
        field: 'walletIdentifier',
        message: 'Wallet identifier must be a string',
      });
    } else {
      const isEmail = this.PATTERNS.EMAIL.test(input.walletIdentifier);
      const isPhone = this.PATTERNS.PHONE.test(input.walletIdentifier);

      if (!isEmail && !isPhone) {
        errors.push({
          field: 'walletIdentifier',
          message:
            'Wallet identifier must be a valid email or 10-digit phone number',
        });
      } else if (input.walletProvider) {
        const phoneOnlyProviders = ['PAYTM', 'PHONEPE', 'MOBIKWIK'];
        const emailOnlyProviders = ['AMAZON_PAY'];

        if (phoneOnlyProviders.includes(input.walletProvider) && !isPhone) {
          errors.push({
            field: 'walletIdentifier',
            message: `${input.walletProvider} requires a phone number as identifier`,
          });
        } else if (
          emailOnlyProviders.includes(input.walletProvider) &&
          !isEmail
        ) {
          errors.push({
            field: 'walletIdentifier',
            message: `${input.walletProvider} requires an email as identifier`,
          });
        }
      }
    }
  }
  static sanitize(input: any): any {
    if (typeof input !== 'object' || input === null) return input;

    const sanitized: any = {};

    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        const value = input[key];
        if (typeof value === 'string') {
          sanitized[key] = value.trim();
        } else {
          sanitized[key] = value;
        }
      }
    }
    if (sanitized.upiId && typeof sanitized.upiId === 'string') {
      sanitized.upiId = sanitized.upiId.toLowerCase();
    }

    return sanitized;
  }
}

export class PaymentMethodService {
  prisma: PrismaClient;
  userid: string;
  constructor(prisma?: PrismaClient, userid?: string) {
    this.prisma = prisma;
    this.userid = userid;
  }
  async addPaymentMethod(input: any): Promise<any> {
    const sanitizedInput = PaymentMethodValidator.sanitize(input);

    const validation = PaymentMethodValidator.validate(sanitizedInput);

    if (!validation.isValid) {
      throw new Error(
        JSON.stringify({
          message: 'Validation failed',
          errors: validation.errors,
        }),
      );
    }

    const validatedData = validation.data!;

    try {
      const isDuplicate = await this.checkForDuplicates(validatedData);
      if (isDuplicate) {
        throw new Error('This payment method already exists');
      }

      const dbData = this.prepareDataForDB(validatedData);

      //   const paymentMethod = await this.prisma.paymentMethod.create({
      //     data: dbData
      //   });

      return {
        success: true,
        data: dbData,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add payment method');
    }
  }

  async checkForDuplicates(data: PaymentMethodInput): Promise<boolean> {
    const { type } = data;

    switch (type) {
      case 'BANK_ACCOUNT': {
        const bankData = data as any;
        const existing = await this.prisma.userpaymentmethods.findFirst({
          where: {
            userid: this.userid,
            accountNumber: bankData.accountNumber,
            ifscCode: bankData.ifscCode,
          },
        });
        return !!existing;
      }

      case 'UPI': {
        const upiData = data as any;
        const existing = await this.prisma.userpaymentmethods.findFirst({
          where: {
            userid: this.userid,
            upiId: upiData.upiId,
          },
        });
        return !!existing;
      }

      case 'WALLET': {
        const walletData = data as any;
        const existing = await this.prisma.userpaymentmethods.findFirst({
          where: {
            userid: this.userid,
            walletProvider: walletData.walletProvider,
            walletIdentifier: walletData.walletIdentifier,
          },
        });
        return !!existing;
      }

      default:
        return false;
    }
  }

   prepareDataForDB(data: PaymentMethodInput): {[key:string]: any} {
    const baseData = {
    //   userId: data.userId,
      nickname: data.nickname || null,
      type: data.type,
      recipientName: data.recipientName,
      isActive: false,
      isVerified: false,
    };

    switch (data.type) {
      case 'BANK_ACCOUNT': {
        const bankData = data as any;
        return {
          ...baseData,
          accountHolderName: bankData.accountHolderName,
          accountNumber: bankData.accountNumber,
          ifscCode: bankData.ifscCode,
          bankName: bankData.bankName,
          branchName: bankData.branchName || null,
          accountType: bankData.accountType,
        };
      }

      case 'UPI': {
        const upiData = data as any;
        return {
          ...baseData,
          upiId: upiData.upiId,
          upiProvider: upiData.upiProvider || null,
        };
      }

      case 'WALLET': {
        const walletData = data as any;
        return {
          ...baseData,
          walletProvider: walletData.walletProvider,
          walletIdentifier: walletData.walletIdentifier,
        };
      }

      default:
        return baseData;
    }
  }

  private async encryptData(text: string): Promise<string> {
    const { randomBytes, createCipheriv } = await import('crypto');
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(
      process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key',
      'utf8',
    ).slice(0, 32);
    const iv = randomBytes(16);
    const cipher = createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private async decryptData(text: string): Promise<string> {
    const { createDecipheriv } = await import('crypto');
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(
      process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key',
      'utf8',
    ).slice(0, 32);
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
