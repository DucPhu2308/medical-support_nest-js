import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { HydratedDocument } from "mongoose";



@Schema({timestamps: true})
export class Shift extends BaseSchema {
    @Prop()
    name : string;
    @Prop()
    startTime : string;
    @Prop()
    endTime : string;

}

export const ShiftSchema = SchemaFactory.createForClass(Shift);

export type ShiftDocument = HydratedDocument<Shift>;