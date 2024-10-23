import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(userId).emit('new-notification', notification);
  }
}
