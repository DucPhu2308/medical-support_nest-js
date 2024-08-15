import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { BaseSchema } from "./base.schema";

@Schema({timestamps: true})
export class Chat extends BaseSchema {
    @Prop()
    name: string;
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    participants: Types.ObjectId[];
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }] })
    messages: Types.ObjectId[];
    @Prop({ default: false })
    isGroup: boolean;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message' })
    lastMessage: Types.ObjectId;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

export type ChatDocument = HydratedDocument<Chat>;