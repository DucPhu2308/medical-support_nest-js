import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { BaseSchema } from "./base.schema";


export enum TypeService {
    directExamination = 'directExamination',
    appointment = 'appointment',
    regularCheckup = 'regularCheckup',
}

@Schema({timestamps: true})
export class ResultRegistration extends BaseSchema {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TimeSlot' })
    timeSlot: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'RecordPatient' })
    recordPatient: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    doctor: mongoose.Types.ObjectId;

    @Prop({ type: String, enum: TypeService, default: TypeService.directExamination })
    typeService: string;

    @Prop({ type: Number, default: 0 })
    fee: number;

    @Prop({ type: Boolean, default: false })
    isPaid: boolean;

}

export const ResultRegistrationSchema = SchemaFactory.createForClass(ResultRegistration);

export type ResultRegistrationDocument = HydratedDocument<ResultRegistration>;