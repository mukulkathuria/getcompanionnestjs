import { errorDto } from 'src/dto/common.dto';
import {
  CardTypeEnum,
  NetBankingNamesEnum,
  paymentdetailsDto,
  PaymentmethodEnum,
  payUTransactionDetailsDto,
  WalletBankEnum,
} from 'src/dto/transactions.dto';
import { UPIBanksData } from 'src/validations/data/transaction.validationdata';

interface payUTransactionDetailsJsonReturnDto {
  data?: paymentdetailsDto;
  error?: errorDto;
}

export const makePaymentdetailsjson = (
  userInput: payUTransactionDetailsDto,
): payUTransactionDetailsJsonReturnDto => {
  const paymentMethod =
    PaymentmethodEnum[userInput?.mode as keyof typeof PaymentmethodEnum];
  const cardDetails = {};
  switch (true) {
    case paymentMethod === PaymentmethodEnum.DC ||
      paymentMethod === PaymentmethodEnum.CC:
      cardDetails['cardType'] =
        CardTypeEnum[userInput.bankcode as keyof typeof CardTypeEnum];
      cardDetails['cardNumber'] = userInput.cardnum;
      break;
    case paymentMethod === PaymentmethodEnum.WALLET:
      cardDetails['walletBank'] =
        WalletBankEnum[userInput.bankcode as keyof typeof WalletBankEnum];
      break;
    case paymentMethod === PaymentmethodEnum.UPI: {
      cardDetails['UPIid'] = userInput.vpa;
      const upibankKeys = Object.keys(UPIBanksData);
      for (let i = 0; i < upibankKeys.length; i++) {
        if (
          UPIBanksData[upibankKeys[i]]
            .split(',')
            .some((l) => userInput.vpa.includes(l.trim()))
        ) {
          cardDetails['UPIBank'] = upibankKeys[i];
          break;
        }
      }
      break;
    }
    case paymentMethod === PaymentmethodEnum.NB:
      cardDetails['bankDetails'] =
        NetBankingNamesEnum[
          userInput.bankcode as keyof typeof NetBankingNamesEnum
        ];
      cardDetails['netBanking'] =
        NetBankingNamesEnum[
          userInput.bankcode as keyof typeof NetBankingNamesEnum
        ];
      break;
    default:
      break;
  }
  const data = {
    paymentId: userInput.undefinedmihpayid || new Date().getTime().toString(),
    paymentMethod:
      PaymentmethodEnum[userInput.mode as keyof typeof PaymentmethodEnum],
    mappedstatus: userInput.unmappedstatus,
    ...cardDetails,
  };
  if (userInput.cardCategory) {
    data['cardCategory'] = userInput.cardCategory;
  }
  return { data };
};
