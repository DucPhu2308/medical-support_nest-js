import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "./user.schema";

@Schema({timestamps: true})
export class Message extends BaseSchema {
    @Prop({ required: true })
    content: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    sender: User;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

export type MessageDocument = HydratedDocument<Message>;

