import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftSegment } from 'src/schemas/shiftSegment.schema';
import { CreateShiftSegmentDto } from './dtos/create-shift-segment.dto';
import { ShiftAssignment } from 'src/schemas/shiftAssignment.schema';
import { GetShiftSegmentDto } from './dtos/get-shift-segment.dto';
import { Shift } from 'src/schemas/shift.schema';

@Injectable()
export class ShiftSegmentService {
    constructor(
        @InjectModel(ShiftSegment.name) private shiftSegmentModel: Model<ShiftSegment>,
        @InjectModel(ShiftAssignment.name) private shiftAssignmentModel: Model<ShiftAssignment>,
        @InjectModel(Shift.name) private shiftModel: Model<Shift>
    ) { }

    async getAllShiftSegments() {
        return this.shiftSegmentModel.find()
            .populate({
                path: 'shiftAssignment',
                populate: [
                    { path: 'shift' }, // Truy xuất thông tin shift
                    {
                        path: 'user',
                        populate: {
                            path: 'doctorInfo',
                            populate: { path: 'specialities' } // Truy xuất specialities trong doctorInfo
                        }

                    }
                ]
            });
    }

    async getShiftSegmentByDoctor(shiftSegmentDoctor: GetShiftSegmentDto) {
        const { doctor, date } = shiftSegmentDoctor;

        // Tìm shiftAssignment liên quan đến doctor
        const shiftAssignments = await this.shiftAssignmentModel.find({
            user: doctor,
            date: date
        }).populate('shift');


        // Lấy danh sách ID của shiftAssignment
        const shiftAssignmentIds = shiftAssignments.map(shiftAssignment => shiftAssignment._id);


        // Tìm shiftSegment dựa theo shiftAssignment và date
        const shiftSegments = await this.shiftSegmentModel
            .find({
                date: date,
                shiftAssignment: { $in: shiftAssignmentIds }
            })
            .populate({
                path: 'shiftAssignment',
                populate: [
                    { path: 'shift' }, // Truy xuất thông tin shift
                    {
                        path: 'user',
                        populate: {
                            path: 'doctorInfo',
                            populate: { path: 'specialities' } // Truy xuất specialities trong doctorInfo
                        }
                    }
                ]
            });

        return shiftSegments;
    }



    async createShiftSegment(createShiftSegmentDto: CreateShiftSegmentDto | CreateShiftSegmentDto[]) {
        if (!Array.isArray(createShiftSegmentDto)) {
            createShiftSegmentDto = [createShiftSegmentDto]; // Chuyển thành mảng nếu chỉ có 1 phần tử
        }

        const shiftSegmentsToCreate = [];

        for (const segment of createShiftSegmentDto) {
            const { startTime, endTime, date, maxRegistrations } = segment;

            if (maxRegistrations <= 0) {
                throw new Error('Max registrations must be greater than zero');
            }

            // Tìm tất cả shiftAssignment trong ngày đã chọn
            const shiftAssignments = await this.shiftAssignmentModel.find({ date }).populate({ path: 'shift' }).exec();

            for (const shiftAssignment of shiftAssignments) {
                const shift = shiftAssignment.shift as unknown as Shift;
                if (!shift) continue;

                // Kiểm tra xem khoảng thời gian của segment có nằm trong ca làm việc không
                if (shift.startTime <= startTime && shift.endTime >= endTime) {
                    const existingSegment = await this.shiftSegmentModel.findOne({
                        shiftAssignment: shiftAssignment._id,
                        startTime,
                        endTime,
                        date,
                    });

                    if (!existingSegment) {
                        shiftSegmentsToCreate.push({
                            shiftAssignment: shiftAssignment._id,
                            startTime,
                            endTime,
                            date,
                            maxRegistrations,
                            currentRegistrations: 0,
                            isFull: false,
                        });
                    }
                }
            }
        }

        if (shiftSegmentsToCreate.length === 0) {
            return [];
        }

        // Chèn dữ liệu mới
        const createdShiftSegments = await this.shiftSegmentModel.insertMany(shiftSegmentsToCreate);

        // Lấy danh sách ID vừa tạo
        const createdSegmentIds = createdShiftSegments.map(segment => segment._id);

        // Truy vấn lại với populate
        return this.shiftSegmentModel
            .find({ _id: { $in: createdSegmentIds } })
            .populate({
                path: 'shiftAssignment',
                populate: [
                    { path: 'shift' }, // Lấy thông tin shift
                    {
                        path: 'user',
                        populate: {
                            path: 'doctorInfo',
                            populate: { path: 'specialities' } // Lấy thông tin chuyên khoa
                        }
                    }
                ]
            });
    }


    async updateCurrentRegistrations(shiftSegmentId: string) {
        const shiftSegment = await this.shiftSegmentModel.findById(shiftSegmentId);

        if (!shiftSegment) {
            return null;
        }

        if (shiftSegment.currentRegistrations < shiftSegment.maxRegistrations) {
            shiftSegment.currentRegistrations += 1;
        }

        if (shiftSegment.currentRegistrations === shiftSegment.maxRegistrations) {
            shiftSegment.isFull = true;
        }

        return shiftSegment.save();
    }


    async updateMaxRegistrations(shiftSegmentId: string, maxRegistrations: number) {
        const shiftSegment = await this.shiftSegmentModel.findById(shiftSegmentId);

        if (!shiftSegment) {
            return null;
        }

        if (shiftSegment.currentRegistrations > maxRegistrations) {
            throw new Error('Max registrations must be greater than current registrations');
        }

        if( maxRegistrations === shiftSegment.currentRegistrations){
            shiftSegment.isFull = true;
        } else {
            shiftSegment.isFull = false;
        }


        shiftSegment.maxRegistrations = maxRegistrations;

        return shiftSegment.save();
    }


    async deleteShiftSegment(shiftSegmentId: string) {
        return this.shiftSegmentModel.findByIdAndDelete(shiftSegmentId);
    }


}
