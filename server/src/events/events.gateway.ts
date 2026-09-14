import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Order } from '../data/db';

@WebSocketGateway({
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:admin')
  handleJoinAdmin(client: Socket) {
    client.join('admin-room');
    this.logger.log(`Client ${client.id} joined admin-room`);
    return { status: 'joined_admin_room' };
  }

  @SubscribeMessage('join:order')
  handleJoinOrder(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
    this.logger.log(`Client ${client.id} listening to order:${orderId}`);
    return { status: `joined_order_${orderId}` };
  }

  /**
   * Broadcast new order to Admin & Godown
   */
  notifyNewOrder(order: Order) {
    this.logger.log(`Broadcasting 'order:new' for Order #${order.orderNumber}`);
    this.server.emit('order:new', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      finalPayable: order.finalPayable,
      itemCount: order.items.length,
      createdAt: order.createdAt,
      items: order.items.map(i => ({
        name: i.productName,
        quantity: i.quantity,
        color: i.color,
        rackLocation: i.rackLocation
      }))
    });
  }

  /**
   * Broadcast order status update (for live customer tracking and staff sync)
   */
  notifyOrderStatusChange(order: Order, note: string) {
    this.logger.log(`Broadcasting status change for Order #${order.orderNumber}: ${order.status}`);
    this.server.emit('order:status_change', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      note,
      updatedAt: new Date().toISOString(),
      order
    });
  }
}
