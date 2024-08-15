import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dtos/message.dto';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService
  ) { }

  @WebSocketServer()
  server: Server;

  /*
    + onConnection: client join room với id của mình
    + khi một người gửi tin nhắn: 
      + server nhận tin nhắn
      + lưu vào db
      + gửi lại tin nhắn vào room có id người nhận
  */

  async handleConnection(client: Socket, ...args: any[]) {

    try{
      const token = client.handshake.auth.token || client.handshake.headers.token;
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      client.join(payload.sub);

      const chats = await this.chatService.getChats(payload.sub);
      this.server.to(payload.sub).emit('list-chats', chats);
    } catch (err) {
      console.log(err);
      client.disconnect();
    }
  }


  @SubscribeMessage('message')
  async handleMessage(client: Socket, message: MessageDto) {
    console.log('client:', client.data.user.sub);
    message.sender = client.data.user.sub;
    await this.chatService.newMessage(message);
    client.to(message.recipient).emit('message', message);
  }
}
