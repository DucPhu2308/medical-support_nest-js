import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";


@Schema({ timestamps: true })
export class MedExamHistory {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    doctor: mongoose.Types.ObjectId;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'RecordPatient' })
    recordPatient: mongoose.Types.ObjectId;
    @Prop({ required: true })
    symptoms: string;
    @Prop({ required: true })
    result: string;
    @Prop({ required: true })
    prescription: string;
}

export const MedExamHistorySchema = SchemaFactory.createForClass(MedExamHistory);

export type MedExamHistoryDocument = HydratedDocument<MedExamHistory>;