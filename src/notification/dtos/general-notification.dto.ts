import { Types } from "mongoose";

// userId: string, content: string, actionUrl: string = '', imageUrl: string = ''
export class GeneralNotificationDto {
    recipient: string | Types.ObjectId;
    content: string;
    actionUrl: string = '';
    imageUrl?: string = '';
}