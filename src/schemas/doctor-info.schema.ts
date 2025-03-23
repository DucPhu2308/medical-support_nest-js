import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { Speciality } from "./speciality.schema";

@Schema()
export class DoctorInfo {
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Speciality' }] })
    specialities: Types.ObjectId[];
    @Prop()
    phone: string;
    @Prop({ default: false })
    isPermission: boolean;
    @Prop()
    treatmentDescription: string;

}

export const DoctorInfoSchema = SchemaFactory.createForClass(DoctorInfo);

export type DoctorInfoDocument = HydratedDocument<DoctorInfo>;