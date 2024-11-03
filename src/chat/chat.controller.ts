import { Controller, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('/:chatId/messages')
    getMessages(@Param('chatId') chatId: string, @Query('page') page: number, @Query('pageSize') pageSize: number) {
        if (page && pageSize) {
            return this.chatService.getMessagesPage(chatId, page, pageSize);
        } else {
            return this.chatService.getMessages(chatId);
        }
    }

    // get private chat of 2 users
    @Get('/private/:userId')
    @UseGuards(AuthGuard)
    getPrivateChat(@Param('userId') userId: string, @Req() req) {
        return this.chatService.getPrivateChat(userId, req.user.sub);
    }

    @Get('/:chatId')
    @UseGuards(AuthGuard)
    getChat(@Param('chatId') chatId: string, @Req() req) {
        return this.chatService.getChatById(chatId, req.user.sub);
    }

    @Get()
    @UseGuards(AuthGuard)
    getChats(@Req() req) {
        return this.chatService.getChats(req.user.sub);
    }

    // /count-unread is conflict with the above /:chatId, so count-unread unuseable
    @Get('/count/unread')
    @UseGuards(AuthGuard)
    countUnread(@Req() req) {
        return this.chatService.getUnreadChatsCount(req.user.sub);
    }

    @Put('/:chatId/mark-as-read')
    @UseGuards(AuthGuard)
    readChat(@Param('chatId') chatId: string, @Req() req) {
        return this.chatService.markChatAsRead(chatId, req.user.sub);
    }
}
