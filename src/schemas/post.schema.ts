import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { CommentDocument } from "./comment.schema";
import { User } from "./user.schema";
import { Speciality } from "./speciality.schema";

export enum PostStatus {
    PENDING = 'PENDING',
    PUBLISHED = 'PUBLISHED',
    REJECTED = 'REJECTED'
}


@Schema({timestamps: true})
export class Post extends BaseSchema {
    @Prop({ required: true })
    title: string;
    @Prop({ required: true })
    content: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    author: Types.ObjectId;
    @Prop({ type: [String]})
    images: string[];
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Speciality' }] })
    tags: Types.ObjectId[];
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]})
    comments: Types.ObjectId[];
    @Prop({type: String, enum: PostStatus, default: PostStatus.PENDING})
    status: string;
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    publishedBy: Types.ObjectId;
    @Prop({type: Boolean, default: false})
    isDeleted: boolean;
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    likedBy: Types.ObjectId[];
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    lovedBy: Types.ObjectId[];
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    surprisedBy: Types.ObjectId[];
    @Prop()
    reasonRejected: string;
}

export type PostDocument = HydratedDocument<Post>;

export const PostSchema = SchemaFactory.createForClass(Post);

    