import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dtos/message.dto';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { AppointmentMessage, AppointmentStatus, MessageType } from 'src/schemas/message.schema';
import { FirebaseService, UploadFolder } from 'src/firebase/firebase.service';
import { MONGO_SELECT } from 'src/common/constances';
import { AppointmentService } from 'src/appointment/appointment.service';
import { off } from 'process';

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
    private readonly firebaseService: FirebaseService,
    private readonly appointmentService: AppointmentService
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
    const message = (await this.chatService.updateApptMessageStatus(messageId, status));
    if (status === AppointmentStatus.ACCEPTED) { // create a separate appointment object on accept
      const appt = message.content as AppointmentMessage;
      await this.appointmentService.createAppointment({
        title: appt.title,
        content: appt.content,
        date: appt.date,
        sender: message.sender,
        recipient: client.data.user.sub,
        message: message._id
      });
    } else if (status === AppointmentStatus.CANCELLED) { // cancel the separate appointment too
      await this.appointmentService.cancelAppointmentByMessageId(message._id);
    }

    const chat = await this.chatService.getChat(message.chat);
    const participants = chat.participants;
    for (const participant of participants) {
      this.server.to(participant.toHexString()).emit('update-message', message);
    }
  }

  @SubscribeMessage('call')
  handleCall(client: Socket, payload: { to: string, offer: any }): void {
    console.log('call:', payload);
    this.server.to(payload.to).emit('call', payload); // Gửi tín hiệu WebRTC
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, payload: { to: string, answer: any }): void {
    console.log('answer:', payload);
    this.server.to(payload.to).emit('answer', payload); // Gửi tín hiệu trả lời
  }

  @SubscribeMessage('nego-needed')
  handleNegoNeeded(client: Socket, payload: { to: string, offer: any }): void {
    console.log('nego-needed:', payload);
    this.server.to(payload.to).emit('nego-needed', {from:  client.data.user.sub, offer: payload.offer}); // Gửi tín hiệu cần thỏa thuận
  }

  @SubscribeMessage('nego-answer')
  handleNegoAnswer(client: Socket, payload: { to: string, answer: any }): void {
    console.log('nego-answer:', payload);
    this.server.to(payload.to).emit('nego-answer', {from:  client.data.user.sub, answer: payload.answer}); // Gửi tín hiệu trả lời thỏa thu
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(client: Socket, payload: { to: string, candidate: any }): void {
    console.log('ice-candidate:', payload);
    this.server.to(payload.to).emit('ice-candidate', payload); // Gửi tín hiệu ICE candidate
  }

  @SubscribeMessage('end-call')
  handleEndCall(client: Socket, payload: { to: string }): void {
    console.log('end-call:', payload.to);
    this.server.to(payload.to).emit('end-call', payload); // Gửi tín hiệu kết thúc cuộc gọi
  }
}
