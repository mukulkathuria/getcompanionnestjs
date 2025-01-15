import { Injectable } from '@nestjs/common';
import * as PayU from 'payu-websdk';
import {
  getHashInputDto,
  initiatePaymentInputDto,
} from 'src/dto/transactions.dto';
import { getTxnId } from '../utils/uuid.utils';
import { createHash } from 'crypto';

@Injectable()
export class PaymentService {
  private readonly client: typeof PayU;
  constructor() {
    this.client = new PayU({
      key: process.env.PAYU_KEY,
      salt: process.env.PAYU_SALT,
    });
  }

  async generateHash(userInput: getHashInputDto) {
    try {
      const key = process.env.PAYU_KEY;
      const salt = process.env.PAYU_SALT;
      const txnid = getTxnId();
      const input = `${key}|${txnid}|${userInput.amount}|${userInput.productinfo}|${userInput.firstname}|${userInput.email}|||||||||||${salt}`;
      const hash = createHash('sha512').update(input).digest('hex');
      return { data: { txnid, hash } };
    } catch (error) {
      return { error: { status: 500, message: error?.message } };
    }
  }

  async initiatePayment(inputs: initiatePaymentInputDto) {
    try {
      const options = {
        key: process.env.PAYU_KEY,
        amount: inputs.amount,
        firstname: inputs.firstname,
        email: inputs.email,
        phone: inputs.phone,
        productinfo: inputs.productinfo,
        surl: inputs.surl, // Success URL
        furl: inputs.furl, // Failure URL
      };
      const { data } = await this.generateHash(options);
      const values = { ...options, hash: data.hash, txnid: data.txnid };
      const transaction = await this.client.paymentInitiate(values);
      return { data: transaction };
    } catch (error) {
      console.log(error);
      return { error: { status: 500, message: error?.message } };
    }
  }

  async makeTransaction(inputs: initiatePaymentInputDto) {
    try {
      const options = {
        key: process.env.PAYU_KEY,
        amount: inputs.amount,
        firstname: inputs.firstname,
        email: inputs.email,
        phone: inputs.phone,
        productinfo: inputs.productinfo,
        surl: inputs.surl, // Success URL
        furl: inputs.furl, // Failure URL
      };
      const { data } = await this.generateHash(options);
      const values = { ...options, hash: data.hash, txnid: data.txnid };
      const formData = new URLSearchParams(values).toString();
      const response = await fetch('https://test.payu.in/_payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });
      if (response.status === 200) {
        console.log('Transaction successful');
        console.log(response);
      }
      return { data: response };
    } catch (error) {
      console.log(error);
      return { error: { status: 500, message: error?.message } };
    }
  }
}
