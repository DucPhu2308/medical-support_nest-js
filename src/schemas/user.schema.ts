import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { HydratedDocument } from "mongoose";

@Schema()
export class User extends BaseSchema {
    @Prop()
    firstName: string;
    @Prop()
    lastName: string;
    @Prop({ unique: true })
    email: string;
    @Prop({ required: true })
    password: string;
    @Prop()
    gender: boolean;
    @Prop()
    avatar: string;
    @Prop()
    background: string;
    @Prop()
    dob: Date;
    @Prop()
    bio: string;
    @Prop()
    activeCode: string;
    @Prop()
    isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;