import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Post('create-order')
  async createOrder(@Body() body: { amount: number; receipt: string }) {
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Valid amount required');
    }
    const receipt = body.receipt || `rcpt_${Date.now()}`;
    return this.razorpayService.createOrder(body.amount, receipt);
  }

  @Post('verify')
  async verifyPayment(
    @Body()
    body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
  ) {
    const isValid = this.razorpayService.verifySignature(
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.razorpaySignature
    );

    if (!isValid) {
      return { verified: false, message: 'Invalid payment signature' };
    }

    return {
      verified: true,
      message: 'Payment successfully verified',
      paymentId: body.razorpayPaymentId
    };
  }
}
