import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
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
    getChat(@Param('chatId') chatId: string) {
        return this.chatService.getChatById(chatId);
    }
}
