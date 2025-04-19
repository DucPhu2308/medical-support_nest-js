import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

@Schema()
export class DrugAssign {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Drug' })
    drug: mongoose.Types.ObjectId;
    @Prop({
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    })
    quantity: number;
}

export const DrugAssignSchema = SchemaFactory.createForClass(DrugAssign);

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
    @Prop({ type: [DrugAssignSchema], default: [] })
    drugAssign: DrugAssign[];
}

export const MedExamHistorySchema = SchemaFactory.createForClass(MedExamHistory);

export type MedExamHistoryDocument = HydratedDocument<MedExamHistory>;