import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from 'src/schemas/chat.schema';
import { AppointmentMessage, AppointmentStatus, Message } from 'src/schemas/message.schema';
import { MessageDto } from './dtos/message.dto';
import { MONGO_SELECT } from 'src/common/constances';

type ChatWithRead = Chat & { isRead: boolean };

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
        @InjectModel(Message.name) private readonly messageModel: Model<Message>
    ) { }

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
        chat.readBy = [message.sender];
        await chat.save();

        return newMessage.populate('sender', MONGO_SELECT.USER.DEFAULT);
    }

    async markChatAsRead(chatId: string, userId: string) {
        const chat = await this.chatModel.findById(chatId);
        if (!chat) {
            throw new HttpException('Chat not found', 404);
        }
        chat.readBy.push(new Types.ObjectId(userId));
        return await chat.save();
    }

    async getUnreadChatsCount(userId: string) {
        return await this.chatModel.countDocuments({ 
            participants: userId, 
            readBy: { $ne: userId },
            lastMessage: { $ne: null }
        });
    }

    async getChatById(chatId: string, userId: string) {
        return await this.chatModel
            .findById(chatId)
            .populate('participants', MONGO_SELECT.USER.DEFAULT)
            .populate('lastMessage')
            .lean<ChatWithRead>()
            .then(chat => {
                chat.isRead = chat.readBy.some(id => id.toHexString() === userId);
                return chat;
            });
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

    // get chats of a user with last message != null
    async getChats(userId: string) {
        return await this.chatModel
            .find({ participants: userId, lastMessage: { $ne: null } })
            .sort({ updatedAt: -1 })
            .populate('participants', MONGO_SELECT.USER.DEFAULT)
            .populate('lastMessage')
            .lean<ChatWithRead[]>()
            .then(chats => {
                return chats.map(chat => {
                    chat.isRead = chat.readBy && chat.readBy.some(id => id.toHexString() === userId);
                    return chat;
                });
            });
    }

    async getMessagesPage(chatId: string, page: number, pageSize: number) {
        return await this.messageModel.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .populate('sender', MONGO_SELECT.USER.DEFAULT);
    }

    async getMessages(chatId: string) {
        return await this.messageModel
            .find({ chat: chatId })
            .populate('sender', MONGO_SELECT.USER.DEFAULT)
            .sort({ createdAt: -1 });
    }

    async getPrivateChat(user1: string, user2: string) {
        let chat = await this.chatModel.findOne({
            participants: { $all: [user1, user2] }
        });
        if (!chat) {
            chat = new this.chatModel({
                participants: [user1, user2],
            });
            await chat.save();
        }

        return chat.populate('participants', MONGO_SELECT.USER.DEFAULT);
    }

    async updateApptMessageStatus(messageId: string, status: string) {
        const message = await this.messageModel.findById(messageId).populate('sender', MONGO_SELECT.USER.DEFAULT);

        if (!message) {
            throw new HttpException('Message not found', 404);
        }

        if (message.type !== 'appointment') {
            throw new HttpException('Message is not an appointment', 400);
        }

        (message.content as AppointmentMessage).apptStatus = status as AppointmentStatus;
        // mark content as modified to trigger save
        message.markModified('content');

        return message.save();
    }

    async getMessage(messageId: string) {
        return await this.messageModel
            .findById(messageId)
            .populate('sender', MONGO_SELECT.USER.DEFAULT);
    }

}
