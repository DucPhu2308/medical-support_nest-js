import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { RecordPatient } from 'src/schemas/recordPatient.sechma';
import { CreateRecordPatientDto } from './dtos/create-record-patient.dto';

@Injectable()
export class RecordPatientService {
    constructor(
        @InjectModel(RecordPatient.name) private recordPatientModel: Model<RecordPatient>
    ) {}

    async findAll() {
        return this.recordPatientModel.find();
    }

    async findById(recordPatientId: string) {
        const userId = recordPatientId;
        return this.recordPatientModel.find({
            createdBy: userId
        })
    }


    async createRecordPatient( createRecordPatientDto: CreateRecordPatientDto) {
        return this.recordPatientModel.create(createRecordPatientDto);
    }

    async updateRecordPatient(recordPatientId: string, createRecordPatientDto: CreateRecordPatientDto) {
        return this.recordPatientModel.findByIdAndUpdate(recordPatientId, createRecordPatientDto);
    }

    async deleteRecordPatient(recordPatientId: string) {    
        return this.recordPatientModel.findByIdAndDelete(recordPatientId);
    }

}
