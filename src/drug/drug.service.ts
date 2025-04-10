import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Drug } from 'src/schemas/drug.schema';
import { CreateDrugDto } from './dtos/create-drug.dto';

@Injectable()
export class DrugService {
    constructor( 
        @InjectModel(Drug.name) private DrugModel: Model<Drug>
    ){}

    async createDrug(DrugData: CreateDrugDto) {
        const newDrug = new this.DrugModel(DrugData);
        return newDrug.save();
    }

    async getAllDrugs() {
        return this.DrugModel.find()
            .populate('type')
            .exec();
    }

    async getDrugById(id: string) {
        return this.DrugModel.findById(id)
            .populate('type')
            .exec();
    }

    async updateDrug(id: string, DrugData: Partial<CreateDrugDto>) {
        const Drug = await this.getDrugById(id);
        if (!Drug) {
            throw new Error('Drug not found');
        }

        Object.assign(Drug, DrugData);
        return Drug.save();

    }

    async deleteDrug(id: string): Promise<{ deletedCount?: number }> {
        const Drug = await this.getDrugById(id);
        if (!Drug) {
            throw new Error('Drug not found');
        }

        return this.DrugModel.deleteOne({ _id: id }).exec();
    }
}
