import { Injectable } from '@nestjs/common';
import * as PayU from 'payu-websdk';
import { getHashInputDto } from 'src/dto/transactions.dto';
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

  async initiatePayment() {
    try {
      const options = {
        key: process.env.PAYU_KEY,
        txnid: getTxnId(),
        amount: '10.00',
        productinfo: 'iPhone',
        firstname: 'PayU',
        email: 'test@gmail.com',
        phone: '9876543210',
        surl: 'localhost:5000',
        furl: 'localhost:5000',
        hash: createHash('sha512').update(process.env.PAYU_KEY).digest('hex'),
      };
      const transaction = await this.client.paymentInitiate(options);
      return { data: transaction };
    } catch (error) {
      console.log(error);
      return { error: { status: 500, message: error?.message } };
    }
  }

  async makeTransaction() {
    try {
      const options = {
        key: process.env.PAYU_KEY,
        txnid: getTxnId(),
        amount: '1.00', // Amount to be paid (in the smallest currency unit, e.g., paise for INR)
        firstname: 'John',
        email: 'john.doe@example.com',
        phone: '9876543210',
        productinfo: 'iPhone',
        surl: 'http://localhost:5000', // Success URL
        furl: 'http://localhost:5000', // Failure URL
        pg: 'cash',
        bankcode: 'cash',
      };
      const { data } = await this.generateHash(options);

      const values = { ...options, hash: data.hash, txnid: data.txnid };
      console.log('values ', values);
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
      }
      const transationDetailsres = await this.client.getTransactionDetails(
        '2024-11-30',
        '2024-11-30',
      );
      const alltransactions = transationDetailsres.Transaction_details.map((l) => {
        if(l.status === 'initiated'){
          return l.id
        }
      }).filter((l) => l)
      console.log(alltransactions)
      for(let i=0;i<alltransactions.length;i+=1){
        const statusRequestData = {
          referenceId: alltransactions[i],
          otp: '12345'
        };
        await fetch('https://test.payu.in/ResponseHandler.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(statusRequestData),
        });
        // console.log(transactiondetailsresponse);
      }
      return { data: response };
    } catch (error) {
      console.log(error);
      return { error: { status: 500, message: error?.message } };
    }
  }
}
