import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedExamHistory } from 'src/schemas/med-exam-history.schema';
import { CreateMedExamHistoryDto } from './dtos/create-med-exam-history.dto';
import { RecordPatient } from 'src/schemas/recordPatient.sechma';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class MedExamHistoryService {
    constructor(
        @InjectModel(MedExamHistory.name) private medExamHistoryModel: Model<MedExamHistory>,
        @InjectModel('RecordPatient') private recordPatientModel: Model<RecordPatient>,
        @InjectModel('User') private userModel: Model<User>,
    ) { }

    async createMedExamHistory(medExamHistory: CreateMedExamHistoryDto) {
        const recordPatient = await this.recordPatientModel.findById(medExamHistory.recordPatient);
        if (!recordPatient) {
            throw new HttpException('RecordPatient not found', 404);
        }
        const doctor = await this.userModel.findById(medExamHistory.doctor);
        if (!doctor) {
            throw new HttpException('Doctor not found', 404);
        }
        const newMedExamHistory = new this.medExamHistoryModel(medExamHistory);
        return newMedExamHistory.save();
    }

    async getMedExamHistoryByRecordPatientId(recordPatientId: string) {
        const recordPatient = await this.recordPatientModel.findById(recordPatientId);
        if (!recordPatient) {
            throw new HttpException('RecordPatient not found', 404);
        }
        return this.medExamHistoryModel.find({ recordPatient: recordPatientId })
            .populate('doctor')
            .sort({ createdAt: -1 });
    }

    async getMedExamHistoryByUserId(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new HttpException('User not found', 404);
        }
        const recordPatients = await this.recordPatientModel.find({ usingBy: userId });
        if (!recordPatients || recordPatients.length === 0) {
            throw new HttpException('RecordPatient not found', 404);
        }
        const recordPatientIds = recordPatients.map(recordPatient => recordPatient._id);
        return this.medExamHistoryModel.find({ recordPatient: { $in: recordPatientIds } })
            .populate({
                path: 'doctor',
                select: 'doctorInfo firstName lastName',
                populate: {
                    path: 'doctorInfo',
                    select: 'specialities',
                    populate: {
                        path: 'specialities',
                        select: 'name'
                    }
                }
            })
            .sort({ createdAt: -1 })
            .populate('recordPatient');
    }
}
