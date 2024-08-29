import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { User } from "./user.schema";

@Schema({ timestamps: true })
export class Comment extends BaseSchema {
    @Prop({ required: true })
    content: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    author: Types.ObjectId;
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
    replies: Types.ObjectId[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true })
    postId: Types.ObjectId;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    likedBy: Types.ObjectId[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null })
    parentId?: Types.ObjectId;

}

export type CommentDocument = HydratedDocument<Comment>;

export const CommentSchema = SchemaFactory.createForClass(Comment);