import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TypeDrug } from 'src/schemas/typedrug.schema';
import { CreateTypeDrugDto } from './dtos/create-typeDrug.dto';

@Injectable()
export class TypeDrugService {
    constructor(
        @InjectModel(TypeDrug.name) private readonly typeDrugModel: Model<TypeDrug>
    ) { } // Constructor is empty, but you can inject services if needed.


    async getAllTypeDrugs() {
        return this.typeDrugModel.find().exec();
    }

    async getTypeDrugById(id: string) {
        return this.typeDrugModel.findById(id).exec();
    }

    async createTypeDrug(typeDrugData: CreateTypeDrugDto) {
        const newTypeDrug = new this.typeDrugModel(typeDrugData);
        return newTypeDrug.save();
    }


    async updateTypeDrug(id: string, typeDrugData: CreateTypeDrugDto) {
        const typeMed = await this.typeDrugModel.findById(id).exec();
        if (!typeMed) {
            throw new Error('TypeDrug not found');
        }

        typeMed.name = typeDrugData.name;
        typeMed.description = typeDrugData.description;
        return typeMed.save();
        
    }

    async deleteTypeDrug(id: string) {
        const typeMed = this.typeDrugModel.findById(id).exec();
        if (!typeMed) {
            throw new Error('TypeDrug not found');
        }
        return this.typeDrugModel.findByIdAndDelete(id).exec();
    }
}
