import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { AppointmentStatus } from "./message.schema";


@Schema({timestamps: true})
export class Appointment {
    @Prop()
    title: string;
    @Prop()
    content: string;
    @Prop()
    date: Date;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    sender: Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    recipient: Types.ObjectId;
    @Prop({ enum: AppointmentStatus, default: AppointmentStatus.ACCEPTED })
    status: AppointmentStatus;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message' })
    message: Types.ObjectId;
    @Prop()
    reminderJobId: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

export type AppointmentDocument = HydratedDocument<Appointment>;