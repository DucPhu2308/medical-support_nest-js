import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { HydratedDocument } from "mongoose";

@Schema({timestamps: true})
export class RecordPatient extends BaseSchema {
    @Prop()
    name: string;

    @Prop()
    dob: string;

    @Prop()
    gender: boolean;

    @Prop()
    address: string;

    @Prop()
    province: string;

    @Prop()
    district: string;

    @Prop()
    ward: string;

    @Prop()
    phoneNumber: string;

    @Prop()
    job: string;

    @Prop()
    createdBy: string;




    @Prop()
    provinceCode: string;

    @Prop()
    districtCode: string;

    @Prop()
    wardCode: string;

}

export type RecordPatientDocument = HydratedDocument<RecordPatient>;

export const RecordPatientSchema = SchemaFactory.createForClass(RecordPatient);