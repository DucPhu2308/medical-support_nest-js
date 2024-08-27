import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dtos/message.dto';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ 
  cors: {
    origin: '*',
  },
})
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
    console.log('client connected:', client.id);

    try{
      const token = client.handshake.auth.token || client.handshake.headers.token;
      console.log('token:', token);
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      client.join(payload.sub);

      // send list chats on connection
      const chats = await this.chatService.getChats(payload.sub);
      this.server.to(payload.sub).emit('list-chats', chats);
    } catch (err) {
      console.log(err);
      client.disconnect();
    }
  }


  /* 
    Save message to db and send to all participants
  */
  @SubscribeMessage('send-message')
  async handleMessage(client: Socket, message: MessageDto) {
    console.log('client:', client.data.user.sub);
    message.sender = client.data.user.sub;
    const newMessage = await this.chatService.newMessage(message);

    const chat = await this.chatService.getChat(message.chat);

    if (!chat) {
      throw new Error('Chat not found');
    } else {
      // send message to all participants
      // const participants = chat.participants.filter(p => p !== message.sender);
      const participants = chat.participants;
      for (const participant of participants) {
        this.server.to(participant.toHexString()).emit('receive-message', newMessage);
      }
    }
  }
}
