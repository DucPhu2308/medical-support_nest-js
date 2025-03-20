import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as crypto from 'crypto';
import * as querystring from 'qs';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class PaymentService {
    constructor(
        private readonly configService: ConfigService
    ) { }

    createPaymentUrl(req: Request): string {
        process.env.TZ = 'Asia/Ho_Chi_Minh';

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');

        const ipAddr = (req.headers['x-forwarded-for'] || req.connection.remoteAddress) as string;

        const tmnCode = this.configService.get<string>('vnp_TmnCode');
        const secretKey = this.configService.get<string>('vnp_HashSecret');
        const vnpUrl = this.configService.get<string>('vnp_Url');
        const returnUrl = this.configService.get<string>('vnp_ReturnUrl');

        const orderId = moment(date).format('DDHHmmss');
        const amount = req.body.amount;
        const bankCode = req.body.bankCode;
        let locale = req.body.language || 'vn';

        const vnp_Params: any = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: locale,
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: encodeURIComponent(`Thanh toan cho ma GD: ${orderId}`.replace(/ /g, '+')),
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: encodeURIComponent(returnUrl),
            vnp_IpAddr:  encodeURIComponent(ipAddr),
            vnp_CreateDate: createDate,
            vnp_BankCode: bankCode
        };
        const sortedParams = this.sortObject(vnp_Params);
        const signData = querystring.stringify(sortedParams, { encode: false });

        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        sortedParams['vnp_SecureHash'] = signed;
        return vnpUrl + '?' + querystring.stringify(sortedParams, { encode: false });
    }

    private sortObject(obj: any) {
        const sorted = {};
        const keys = Object.keys(obj).sort();
        keys.forEach((key) => {
            sorted[key] = obj[key];
        });
        return sorted;
    }
}