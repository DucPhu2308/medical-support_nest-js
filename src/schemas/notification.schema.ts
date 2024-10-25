import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import mongoose, { HydratedDocument, Mongoose, Types } from "mongoose";

export enum NotificationType {
    POST_REACT = 'post_like',
    POST_COMMENT = 'post_comment',
    REPLY_COMMENT = 'reply_comment',
    APPOINTMENT_REMINDER = 'appointment_reminder',
    GENERAL = 'general'
}

@Schema({ timestamps: true })
export class Notification extends BaseSchema {
    @Prop({ required: true })
    content: string;
    @Prop({ required: true, enum: NotificationType })
    type: NotificationType;
    // @Prop({ required: true, type: [{ type: mongoose.Schema.Types.Mixed }] })
    // subjects: any[];
    @Prop({ type: mongoose.Schema.Types.Mixed })
    directObject: any;
    // @Prop({ type: mongoose.Schema.Types.Mixed})
    // indirectObject: any;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    recipient: Types.ObjectId;
    @Prop()
    actionUrl: string;
    @Prop({ default: false })
    isRead: boolean;
    @Prop()
    imageUrl: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

export type NotificationDocument = HydratedDocument<Notification>;