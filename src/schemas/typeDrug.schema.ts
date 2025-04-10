import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { HydratedDocument } from "mongoose";


@Schema({ timestamps: true })
export class TypeDrug extends BaseSchema {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, default: null })
    description: string;
}

export const TypeDrugSchema = SchemaFactory.createForClass(TypeDrug);

export type TypeDrugDocument = HydratedDocument<TypeDrug>;