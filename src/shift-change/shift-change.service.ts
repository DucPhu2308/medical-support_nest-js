import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftChange } from 'src/schemas/shiftChange.schema';
import { CreateRequestShiftChangeDto } from './dtos/create-request-shift-change.dto';
import path from 'path';
import { StatusRequestDto } from './dtos/status-request.dto';

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

    async getShiftChangeByUserId(userId: string) {
        return this.shiftChangeModel.find({
            $or: [
                { currentDoctor: userId }
            ]
        }).populate({
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

    async updateRequestShiftChange(shiftChangeId: string, createRequestShiftChangeDto: CreateRequestShiftChangeDto) {
        return this.shiftChangeModel.updateOne({ _id: shiftChangeId }, createRequestShiftChangeDto);
    }

    async updateStatusShiftChange(shiftChangeId: string, statusRequest: StatusRequestDto) {
        const shiftChange = await this.shiftChangeModel.findById(shiftChangeId);
        if (!shiftChange) {
            return null;
        }
        if (statusRequest.status === 'REJECTED') {
            shiftChange.reasonRejected = statusRequest.reason;
        }
        shiftChange.status = statusRequest.status;
        return shiftChange.save();
    }

    async deleteRequestShiftChange(shiftChangeId: string): Promise<{ deletedCount?: number }> {
        return this.shiftChangeModel.deleteOne({ _id: shiftChangeId });
    }

}
