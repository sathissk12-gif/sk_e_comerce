import { Module } from '@nestjs/common';
import { EventsGateway } from './events/events.gateway';
import { ProductsController } from './products/products.controller';
import { CouponsController } from './coupons/coupons.controller';
import { OrdersController } from './orders/orders.controller';
import { GodownController } from './godown/godown.controller';
import { DispatchController } from './dispatch/dispatch.controller';
import { PaymentsController } from './payments/payments.controller';
import { RazorpayService } from './payments/razorpay.service';

@Module({
  imports: [],
  controllers: [
    ProductsController,
    CouponsController,
    OrdersController,
    GodownController,
    DispatchController,
    PaymentsController
  ],
  providers: [EventsGateway, RazorpayService]
})
export class AppModule {}
