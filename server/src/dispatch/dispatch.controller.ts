import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { DatabaseStore } from '../data/db';
import { EventsGateway } from '../events/events.gateway';

@Controller('api/dispatch')
export class DispatchController {
  private db = DatabaseStore.getInstance();

  constructor(private readonly eventsGateway: EventsGateway) {}

  @Get('queue')
  getDispatchQueue() {
    const queue = this.db.orders.filter(
      o => o.status === 'PACKED_READY_FOR_DISPATCH'
    );
    return {
      success: true,
      count: queue.length,
      orders: queue
    };
  }

  @Post('ship/:id')
  dispatchOrder(
    @Param('id') id: string,
    @Body()
    body: {
      courierPartner: string;
      trackingNumber?: string;
      expectedDays?: number;
    }
  ) {
    const order = this.db.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    if (order.status !== 'PACKED_READY_FOR_DISPATCH') {
      throw new BadRequestException(
        `Order is in status ${order.status}. Only packed orders can be dispatched.`
      );
    }

    const courier = body.courierPartner || 'Blue Dart Express';
    const tracking =
      body.trackingNumber || `TRK${Date.now().toString().slice(-8)}`;
    const nowIso = new Date().toISOString();
    const days = body.expectedDays || 3;
    const estDelivery = new Date(Date.now() + 86400000 * days).toLocaleDateString(
      'en-IN',
      { day: 'numeric', month: 'short', year: 'numeric' }
    );

    order.status = 'DISPATCHED';
    order.dispatchDetails = {
      courierPartner: courier,
      trackingNumber: tracking,
      dispatchedAt: nowIso,
      expectedDelivery: estDelivery,
      trackingUrl: `https://track.festivecouriers.in/${tracking}`
    };

    order.statusHistory.push({
      status: 'DISPATCHED',
      timestamp: nowIso,
      note: `Handed over to ${courier}. AWB / Tracking #: ${tracking}. Expected delivery by ${estDelivery}.`
    });

    this.db.save();

    // Broadcast WebSocket status update for live customer tracking
    this.eventsGateway.notifyOrderStatusChange(
      order,
      `Your festive order has been dispatched via ${courier} (#${tracking})!`
    );

    return {
      success: true,
      message: 'Order dispatched successfully',
      order
    };
  }

  @Post('deliver/:id')
  markDelivered(@Param('id') id: string) {
    const order = this.db.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    const nowIso = new Date().toISOString();
    order.status = 'DELIVERED';
    order.statusHistory.push({
      status: 'DELIVERED',
      timestamp: nowIso,
      note: 'Package successfully delivered to customer doorstep.'
    });

    this.db.save();

    this.eventsGateway.notifyOrderStatusChange(
      order,
      'Package has been successfully delivered!'
    );

    return {
      success: true,
      message: 'Order marked as DELIVERED',
      order
    };
  }
}
