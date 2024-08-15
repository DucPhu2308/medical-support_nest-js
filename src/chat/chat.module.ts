import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from 'src/schemas/chat.schema';
import { Message, MessageSchema } from 'src/schemas/message.schema';
import { ChatService } from './chat.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema }
    ]),
  ],
  providers: [ChatGateway, ChatService]
})
export class ChatModule {}
