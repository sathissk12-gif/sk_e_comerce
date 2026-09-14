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

@Controller('api/godown')
export class GodownController {
  private db = DatabaseStore.getInstance();

  constructor(private readonly eventsGateway: EventsGateway) {}

  @Get('queue')
  getPackingQueue() {
    const queue = this.db.orders.filter(o => o.status === 'APPROVED_TO_GODOWN');
    return {
      success: true,
      count: queue.length,
      orders: queue
    };
  }

  @Get('inventory')
  getInventory() {
    const stockReport: Array<{
      productId: string;
      productName: string;
      variantName: string;
      sku: string;
      stockQty: number;
      rackLocation: string;
    }> = [];

    for (const p of this.db.products) {
      for (const v of p.variants) {
        stockReport.push({
          productId: p.id,
          productName: p.name,
          variantName: v.name,
          sku: v.sku,
          stockQty: v.stockQty,
          rackLocation: v.rackLocation
        });
      }
    }

    return {
      success: true,
      totalItems: stockReport.length,
      inventory: stockReport
    };
  }

  @Get('pick-slip/:id')
  getPickSlip(@Param('id') id: string) {
    const order = this.db.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    return {
      success: true,
      slip: {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        shippingCity: order.shippingAddress.city,
        itemsToPick: order.items.map(i => ({
          sku: i.sku,
          productName: i.productName,
          color: i.color,
          capacity: i.capacity,
          quantity: i.quantity,
          rackLocation: i.rackLocation
        }))
      }
    };
  }

  @Post('pack/:id')
  packOrder(
    @Param('id') id: string,
    @Body() body: { packedBy?: string; rackNote?: string }
  ) {
    const order = this.db.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    if (order.status !== 'APPROVED_TO_GODOWN') {
      throw new BadRequestException(
        `Order is in status ${order.status}. Only APPROVED_TO_GODOWN orders can be packed.`
      );
    }

    const packer = body.packedBy || 'Godown Warehouse Team';
    const nowIso = new Date().toISOString();

    // Deduct stock from inventory
    for (const item of order.items) {
      const prod = this.db.products.find(p => p.id === item.productId);
      if (prod) {
        const variant = prod.variants.find(v => v.id === item.variantId);
        if (variant) {
          variant.stockQty = Math.max(0, variant.stockQty - item.quantity);
        }
      }
    }

    order.status = 'PACKED_READY_FOR_DISPATCH';
    order.godownDetails = {
      packedBy: packer,
      packedAt: nowIso,
      rackLocations: Array.from(new Set(order.items.map(i => i.rackLocation)))
    };

    order.statusHistory.push({
      status: 'PACKED_READY_FOR_DISPATCH',
      timestamp: nowIso,
      note: `Packed and quality-checked by ${packer}. Inventory deducted. Transferred to Dispatch Bay.`
    });

    this.db.save();

    // Broadcast WebSocket status update
    this.eventsGateway.notifyOrderStatusChange(
      order,
      `Order packed by ${packer} and ready in Dispatch bay.`
    );

    return {
      success: true,
      message: 'Order packed successfully and moved to Dispatch Bay.',
      order
    };
  }
}
