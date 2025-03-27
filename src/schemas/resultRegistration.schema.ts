import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { BaseSchema } from "./base.schema";


@Schema({timestamps: true})
export class ResultRegistration extends BaseSchema {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ShiftSegment' })
    shiftSegment: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'RecordPatient' })
    recordPatient: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    doctor: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MedExamService' })
    medExamService: mongoose.Types.ObjectId;

    @Prop({ type: Number, default: 0 })
    fee: number;

    @Prop({ type: Boolean, default: false })
    isPaid: boolean;

    @Prop({ type: String, default: null})
    description: string;

}

export const ResultRegistrationSchema = SchemaFactory.createForClass(ResultRegistration);

export type ResultRegistrationDocument = HydratedDocument<ResultRegistration>;