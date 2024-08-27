import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from 'src/schemas/chat.schema';
import { Message } from 'src/schemas/message.schema';
import { MessageDto } from './dtos/message.dto';
import { MONGO_SELECT } from 'src/common/constances';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
        @InjectModel(Message.name) private readonly messageModel: Model<Message>
    ) { }

    /*
    async newMessage(message: MessageDto) {

        const newMessage = new this.messageModel({
            content: message.content,
            sender: message.sender,
            type: message.type,
        });

        await newMessage.save();

        let chat = await this.chatModel.findOne({
            participants: { $all: [message.sender, message.recipient] }
        });

        if (!chat) {
            chat = new this.chatModel({
                participants: [message.sender, message.recipient],
                messages: []
            });
        }
        chat.messages.push(newMessage._id);
        chat.lastMessage = newMessage._id;
        await chat.save();
    }
    */

    async newMessage(message: MessageDto) {

        const chat = await this.chatModel.findById(message.chat);

        if (!chat) {
            throw new HttpException('Chat not found', 404);
        }

        const newMessage = new this.messageModel({
            content: message.content,
            sender: message.sender,
            type: message.type,
            chat: message.chat
        });

        await newMessage.save();
        chat.lastMessage = newMessage._id;
        await chat.save();

        return newMessage;
    }

    async newChat(participants: string[]) {
        const chat = new this.chatModel({
            participants: participants,
            messages: []
        });
        return await chat.save();
    }

    async getChat(chatId: string | Types.ObjectId) {
        return await this.chatModel.findById(chatId);
    }

    async getChats(userId: string) {
        return await this.chatModel.find({ participants: userId })
            .select('-messages') // exclude messages to reduce payload size
            .populate('participants', MONGO_SELECT.USER.DEFAULT)
            .populate('lastMessage');
    }

    async getMessagesPage(chatId: string, page: number, pageSize: number) {
        return await this.messageModel.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);
    }

    async getMessages(chatId: string) {
        return await this.messageModel
            .find({ chat: chatId })
            .sort({ createdAt: -1 });
    }



}
