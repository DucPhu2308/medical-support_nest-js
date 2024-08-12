import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import mongoose, { HydratedDocument, Types } from "mongoose";

@Schema({timestamps: true})
export class Chat {
    @Prop()
    name: string;
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    participants: Types.ObjectId[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

export type ChatDocument = HydratedDocument<Chat>;