import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dtos/message.dto';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { MessageType } from 'src/schemas/message.schema';
import { FirebaseService, UploadFolder } from 'src/firebase/firebase.service';
import { MONGO_SELECT } from 'src/common/constances';

@WebSocketGateway({ 
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e8, // 100MB
})
export class ChatGateway implements OnGatewayConnection {

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService
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
      // const chats = await this.chatService.getChats(payload.sub);
      // this.server.to(payload.sub).emit('list-chats', chats);
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

    const chat = await this.chatService.getChat(message.chat);

    if (!chat) {
      throw new Error('Chat not found');
    } else {
      let newMessage;
      if (message.type === MessageType.TEXT || message.type === MessageType.APPOINTMENT) {
        newMessage = (await this.chatService.newMessage(message));
      } else if (message.type === MessageType.IMAGE) {
        const images = await Promise.all(
          message.content.map(async (image: Buffer) => {
            return await this.firebaseService.uploadImageBuffer(image, UploadFolder.MESSAGE);
          })
        );
        newMessage = await this.chatService.newMessage({ ...message, content: images });
      }

      // send message to all participants
      const participants = chat.participants;
      for (const participant of participants) {
        this.server.to(participant.toHexString()).emit('receive-message', newMessage);
      }
    }
  }

  @SubscribeMessage('update-appt-message-status')
  async updateApptMessageStatus(client: Socket, data: { messageId: string, status: string }) {
    const { messageId, status } = data;
    console.log('update-appt-message-status:', messageId, status);
    const message = await this.chatService.updateApptMessageStatus(messageId, status);

    const chat = await this.chatService.getChat(message.chat);
    const participants = chat.participants;
    for (const participant of participants) {
      this.server.to(participant.toHexString()).emit('update-message', message);
    }
  }
}
