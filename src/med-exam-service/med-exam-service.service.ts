import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedExamService } from 'src/schemas/medExamService.schema';
import { CreateMedExamServiceDto } from './dtos/create-medExamService.dto';

@Injectable()
export class MedExamServiceService {
    constructor(
        @InjectModel(MedExamService.name) private medExamServiceModel: Model<MedExamService>
    ) {}

    async findAllMedExamServices() {
        return this.medExamServiceModel.find();
    }

    async createMedExamService( CreateMedExamServiceDto: CreateMedExamServiceDto) {
        const newMedExamService = new this.medExamServiceModel(CreateMedExamServiceDto);
        return newMedExamService.save();
    }

    async updateMedExamService(id: string, CreateMedExamServiceDto: CreateMedExamServiceDto) {
        return this.medExamServiceModel.findByIdAndUpdate(id, CreateMedExamServiceDto, { new: true });
    }

    async deleteMedExamService(id: string) {
        return this.medExamServiceModel.findByIdAndDelete(id);
    }
}
