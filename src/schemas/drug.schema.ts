import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import mongoose, { HydratedDocument, mongo } from "mongoose";


@Schema({timestamps: true})
export class Drug extends BaseSchema {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TypeDrug', required: true })
    type: mongoose.Schema.Types.ObjectId;

    @Prop({ type: String, required: true })
    brand: string;

    @Prop({ type: Number, required: true })
    dosage: number;

    @Prop({ type: String, default: null })
    description: string;
}

export const DrugSchema = SchemaFactory.createForClass(Drug);

export type DrugDocument = HydratedDocument<Drug>;