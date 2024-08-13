import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import mongoose, { HydratedDocument, Types } from "mongoose";

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    APPOINTMENT = 'appointment',
    FILE = 'file',
    CALL = 'call',
}

export interface AppointmentMessage {
    title: string;
    content: string;
    date: Date;
    isAccepted: boolean;
}

export interface CallMessage {
    duration: number;
    isAccepted: boolean;
}

@Schema({timestamps: true})
export class Message extends BaseSchema {
    @Prop({ required: true })
    content: string | AppointmentMessage | CallMessage;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    sender: Types.ObjectId;

    @Prop({ enum: MessageType})
    type: MessageType;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

export type MessageDocument = HydratedDocument<Message>;

