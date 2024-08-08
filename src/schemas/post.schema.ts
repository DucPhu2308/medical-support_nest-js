import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { CommentDocument } from "./comment.schema";
import { User } from "./user.schema";
import { Speciality } from "./speciality.schema";

@Schema({timestamps: true})
export class Post extends BaseSchema {
    @Prop({ required: true })
    title: string;
    @Prop({ required: true })
    content: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    author: User;
    @Prop({ type: [String]})
    images: string[];
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Speciality' }]})
    tags: Speciality[];
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]})
    comments: Comment[];
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    likedBy: User[];
}

export type PostDocument = HydratedDocument<Post>;

export const PostSchema = SchemaFactory.createForClass(Post);

    