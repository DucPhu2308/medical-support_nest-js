import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { HydratedDocument } from "mongoose";

@Schema({timestamps: true})
export class Speciality extends BaseSchema {
    @Prop({ required: true })
    name: string;
}

export const SpecialitySchema = SchemaFactory.createForClass(Speciality);

export type SpecialityDocument = HydratedDocument<Speciality>;