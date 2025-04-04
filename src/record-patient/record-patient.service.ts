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
            usingBy: userId
        })
    }


    async createRecordPatient( createRecordPatientDto: CreateRecordPatientDto) {
        const recordData = { ...createRecordPatientDto, usingBy: createRecordPatientDto.createdBy };
        return this.recordPatientModel.create(recordData);
    }

    async updateRecordPatient(recordPatientId: string, createRecordPatientDto: CreateRecordPatientDto) {
        return this.recordPatientModel.findByIdAndUpdate(recordPatientId, createRecordPatientDto);
    }

    async deleteRecordPatient(recordPatientId: string) {    
        return this.recordPatientModel.findByIdAndDelete(recordPatientId);
    }

    async searchRecordPatient(search: string) {
        // search theo tên bệnh nhân hoặc số điện thoại
        // nếu là sdt thì phải đúng chính xác
        // nếu là tên thì có thể đúng một phần, không phân biệt hoa thường
        return this.recordPatientModel.find({
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { phoneNumber: search }
            ]
        });
    }


    async updateUsingBy(recordPatientId: string, usingBy: string) {
        return this.recordPatientModel.findByIdAndUpdate(recordPatientId, { usingBy });
    }

}
