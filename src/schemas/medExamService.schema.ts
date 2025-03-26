import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { HydratedDocument } from "mongoose";


@Schema( { timestamps: true })
export class MedExamService extends BaseSchema {

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    fee: string;

}

export const MedExamServiceSchema = SchemaFactory.createForClass(MedExamService);

export type MedExamServiceDocument = HydratedDocument<MedExamService>;