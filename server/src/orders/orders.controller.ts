import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { DatabaseStore, Order, OrderItem, OrderStatus } from '../data/db';
import { EventsGateway } from '../events/events.gateway';
import { AdminGuard } from '../auth/admin.guard';

@Controller('api/orders')
export class OrdersController {
  private db = DatabaseStore.getInstance();

  constructor(private readonly eventsGateway: EventsGateway) {}

  @Get()
  getAll(@Query('status') status?: OrderStatus) {
    let list = this.db.orders;
    if (status) {
      list = list.filter(o => o.status === status);
    }
    // Sort newest first
    list = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return { success: true, total: list.length, orders: list };
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    const order = this.db.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }
    return { success: true, order };
  }

  @Post()
  createOrder(
    @Body()
    body: {
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      shippingAddress: {
        street: string;
        city: string;
        state: string;
        pincode: string;
      };
      items: Array<{
        productId: string;
        variantId: string;
        color?: string;
        quantity: number;
      }>;
      couponCode?: string;
      paymentMode: 'RAZORPAY' | 'COD' | 'TEST_PAY';
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
    }
  ) {
    if (!body.customerName || !body.customerPhone || !body.shippingAddress) {
      throw new BadRequestException('Customer name, phone, and delivery address are required.');
    }

    if (!body.items || body.items.length === 0) {
      throw new BadRequestException('Order must contain at least 1 item.');
    }

    const orderItems: OrderItem[] = [];
    let subtotalMrp = 0;
    let subtotalOffer = 0;

    for (const item of body.items) {
      const prod = this.db.products.find(p => p.id === item.productId);
      if (!prod) continue;
      const variant = prod.variants.find(v => v.id === item.variantId) || prod.variants[0];
      const qty = Math.max(1, item.quantity || 1);

      const itemMrpTotal = variant.mrp * qty;
      const itemOfferTotal = variant.offerPrice * qty;

      subtotalMrp += itemMrpTotal;
      subtotalOffer += itemOfferTotal;

      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        variantId: variant.id,
        sku: variant.sku,
        color: item.color || variant.colors[0] || 'Standard',
        capacity: variant.capacity,
        quantity: qty,
        mrp: variant.mrp,
        offerPrice: variant.offerPrice,
        totalPrice: itemOfferTotal,
        imageUrl: prod.imageUrl,
        rackLocation: variant.rackLocation || 'RACK-GEN'
      });
    }

    if (orderItems.length === 0) {
      throw new BadRequestException('Could not resolve ordered items.');
    }

    // Savings from Festive booklet offer
    const bookletSavings = subtotalMrp - subtotalOffer;

    // Coupon calculation
    let couponDiscount = 0;
    if (body.couponCode) {
      const coupon = this.db.coupons.find(
        c => c.code.toUpperCase() === body.couponCode.trim().toUpperCase()
      );
      if (coupon && subtotalOffer >= coupon.minOrder) {
        if (coupon.discountType === 'percentage') {
          couponDiscount = Math.round((subtotalOffer * coupon.value) / 100);
        } else {
          couponDiscount = coupon.value;
        }
      }
    }

    const finalPayable = Math.max(0, subtotalOffer - couponDiscount);
    const orderRandom = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-2026-${orderRandom}`;
    const orderId = `ord-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      createdAt: nowIso,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail || '',
      shippingAddress: body.shippingAddress,
      items: orderItems,
      subtotalMrp,
      savingsTotal: bookletSavings + couponDiscount,
      couponCode: body.couponCode,
      couponDiscount,
      finalPayable,
      paymentMode: body.paymentMode || 'COD',
      paymentStatus: body.paymentMode === 'COD' ? 'PENDING' : 'PAID',
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      status: 'ORDER_PLACED',
      statusHistory: [
        {
          status: 'ORDER_PLACED',
          timestamp: nowIso,
          note: `Festive order placed via Next.js website. Payment Mode: ${body.paymentMode}`
        }
      ]
    };

    // Save to Database
    this.db.orders.unshift(newOrder);
    this.db.save();

    // Broadcast Real-time WebSocket Alert to Admin & Godown
    this.eventsGateway.notifyNewOrder(newOrder);

    return {
      success: true,
      message: 'Order placed successfully',
      order: newOrder
    };
  }

  @UseGuards(AdminGuard)
  @Post(':id/approve')
  approveOrder(@Param('id') id: string) {
    const order = this.db.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    if (order.status !== 'ORDER_PLACED') {
      throw new BadRequestException(`Order already in status ${order.status}`);
    }

    const nowIso = new Date().toISOString();
    order.status = 'APPROVED_TO_GODOWN';
    order.statusHistory.push({
      status: 'APPROVED_TO_GODOWN',
      timestamp: nowIso,
      note: 'Admin verified order details & approved to Godown warehouse for stock picking.'
    });

    this.db.save();

    // Broadcast WebSocket status update
    this.eventsGateway.notifyOrderStatusChange(
      order,
      'Order approved by Admin and sent to Godown for packing.'
    );

    return {
      success: true,
      message: 'Order approved and sent to Godown',
      order
    };
  }
}
