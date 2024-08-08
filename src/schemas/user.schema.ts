import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { DoctorInfo } from "./doctor-info.schema";

@Schema({timestamps: true})
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
    @Prop({ type: [{ type: String, enum: ['CLIENT', 'DOCTOR', 'NURSE', 'ADMIN']}], default: ['CLIENT'] })
    roles: string[];
    @Prop({ type: DoctorInfo})
    doctorInfo: DoctorInfo; 
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;