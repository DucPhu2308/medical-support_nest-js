import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { DoctorInfo } from "./doctor-info.schema";


export enum UserRole {
    CLIENT = 'CLIENT',
    DOCTOR = 'DOCTOR',
    NURSE = 'NURSE',
    ADMIN = 'ADMIN'
}

@Schema({ timestamps: true })
export class User extends BaseSchema {
    @Prop()
    firstName: string;
    @Prop()
    lastName: string;
    @Prop({ unique: true, required: true })
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
    @Prop({ default: false })
    isActive: boolean;
    @Prop({ type: [{ type: String, enum: UserRole }], default: [UserRole.CLIENT] })
    roles: string[];
    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
    following: mongoose.Types.ObjectId[];
    @Prop({ type: DoctorInfo })
    doctorInfo: DoctorInfo;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;