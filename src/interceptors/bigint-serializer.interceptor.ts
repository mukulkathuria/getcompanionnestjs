/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.convertBigIntToString(data);
      }),
    );
  }

  private convertBigIntToString(data: any): any {
    if (typeof data === 'object' && !Array.isArray(data) && data instanceof Object) {
      const newData = {};
      for (const key in data) {
        newData[key] = this.convertBigIntToString(data[key]);
      }
      return newData;
    } else if (typeof data === 'bigint') {
      return data.toString();
    } else if (Array.isArray(data)) {
      return data.map((item) => this.convertBigIntToString(item));
    }
    return data;
  }
}
