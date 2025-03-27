import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftChange } from 'src/schemas/shiftChange.schema';
import { CreateRequestShiftChangeDto } from './dtos/create-request-shift-change.dto';
import path from 'path';

@Injectable()
export class ShiftChangeService {
    constructor(
        @InjectModel(ShiftChange.name) private shiftChangeModel: Model<ShiftChange>
    ) { }

    async getAllShiftChanges() {
        return this.shiftChangeModel.find()
            .populate({
                path: 'currentDoctor',
                populate: {
                    path: 'doctorInfo',
                    populate: { path: 'specialities' }  // Truy xuất chuyên khoa
                }
            })
            .populate({
                path: 'newDoctor',
                populate: {
                    path: 'doctorInfo',
                    populate: { path: 'specialities' }  // Truy xuất chuyên khoa
                }
            })
            .populate({
                path: 'shiftAssignment',
                populate: {
                    path: 'shift'
                }

            });
    }

    async createRequestShiftChange(createRequestShiftChangeDto: CreateRequestShiftChangeDto) {
        const newShiftChange = new this.shiftChangeModel({
            currentDoctor: createRequestShiftChangeDto.currentDoctorId,
            newDoctor: createRequestShiftChangeDto.newDoctorId,
            date: createRequestShiftChangeDto.date,
            shiftAssignment: createRequestShiftChangeDto.currentShiftAssignmentId,
            reason: createRequestShiftChangeDto.reason
        });
        return newShiftChange.save();
    }

}
