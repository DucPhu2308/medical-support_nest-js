import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/api/payment')
@ApiTags('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService
    ) { }

    @Post('create-payment-url')
    @UseGuards(AuthGuard)
    async createPaymentUrl(@Req() req: Request, @Res() res: Response) {
        const paymentUrl = this.paymentService.createPaymentUrl(req);
        return res.json({
            paymentUrl: paymentUrl
        });
    }
}
