import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";


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
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

export type AppointmentDocument = HydratedDocument<Appointment>;