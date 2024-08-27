import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

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
}
