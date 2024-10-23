import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    @UseGuards(AuthGuard)
    async getNotifications(@Req() req) {
        return this.notificationService.getNotifications(req.user.sub);
    }

    @Put('mark-as-read')
    @UseGuards(AuthGuard)
    async markAsRead(@Body('notificationIds') notificationIds: string[], @Req() req) {
        return this.notificationService.markAsRead(notificationIds, req.user.sub);
    }


}
