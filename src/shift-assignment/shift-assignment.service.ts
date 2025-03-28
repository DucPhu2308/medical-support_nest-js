import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftAssignment } from 'src/schemas/shiftAssignment.schema';
import { CreateShiftAssignmentDto } from './dtos/create-shift-assignment.dto';
import { GetShiftAssignmentDto } from './dtos/get-shift-assignment.dto';
import { GetMyShiftsFilterDto } from './dtos/get-my-shifts-filter.dto';
import { ShiftChangeDataDto } from './dtos/shift-change-data.dto';

@Injectable()
export class ShiftAssignmentService {
    constructor(
        @InjectModel(ShiftAssignment.name) private readonly shiftAssignmentModel: Model<ShiftAssignment>

    ) { }

    async getShiftAssignments(getShiftAssignmentDto: GetShiftAssignmentDto) {
        if (getShiftAssignmentDto.startDate && getShiftAssignmentDto.endDate) {
            if (getShiftAssignmentDto.doctorId) {
                return this.shiftAssignmentModel.find({
                    date: {
                        $gte: getShiftAssignmentDto.startDate,
                        $lte: getShiftAssignmentDto.endDate
                    },
                    user: getShiftAssignmentDto.doctorId
                }).populate('shift').populate('user');
            }
            return this.shiftAssignmentModel.find({
                date: {
                    $gte: getShiftAssignmentDto.startDate,
                    $lte: getShiftAssignmentDto.endDate
                },
            }).populate('shift').populate('user');
        }
        return null;
    }

    async getShiftAssignmentsByDoctorExpect(doctorId: string, userId: string) {
        const today = new Date().toISOString().split('T')[0];

        // Lấy tất cả ca trực từ hôm nay trở đi
        const shiftAssignments = await this.shiftAssignmentModel.find({
            user: doctorId,
            date: { $gte: today }
        }).populate('shift', 'name startTime endTime');

        // Tìm tất cả ca trực trong cùng ngày mà có userId
        const userShifts = await this.shiftAssignmentModel.find({
            user: userId,
            date: { $gte: today }
        });

        // Lọc bỏ những ca mà userId đã có mặt
        const filteredAssignments = shiftAssignments.filter(shift =>
            !userShifts.some(userShift => userShift.date === shift.date)
        );

        return filteredAssignments;
    }


    async createShiftAssignment(createShiftAssignmentDto: CreateShiftAssignmentDto | CreateShiftAssignmentDto[]) {
        if (Array.isArray(createShiftAssignmentDto)) {
            const receivedAssignments = createShiftAssignmentDto;
            const receivedKeys = receivedAssignments.map(assignment =>
                `${assignment.doctorId}-${assignment.shiftId}-${assignment.date}`
            );
            const receivedDates = [...new Set(receivedAssignments.map(assignment => assignment.date))];
            const receivedDoctorIds = [...new Set(receivedAssignments.map(assignment => assignment.doctorId))];

            // Lấy tất cả các ca trực từ cơ sở dữ liệu theo ngày và doctorId tương ứng
            const existingAssignments = await this.shiftAssignmentModel.find({
                user: { $in: receivedDoctorIds },
                date: { $in: receivedDates }
            });

            const existingKeys = existingAssignments.map(assignment =>
                `${assignment.user}-${assignment.shift}-${assignment.date}`
            );

            // Lọc các ca trực cần xóa (Chỉ xóa của bác sĩ hiện tại trong mảng receivedDoctorIds)
            const assignmentsToDelete = existingAssignments.filter(assignment => {
                const key = `${assignment.user}-${assignment.shift}-${assignment.date}`;
                return !receivedKeys.includes(key);
            });

            // Xóa các ca trực cần xóa
            if (assignmentsToDelete.length > 0) {
                await this.shiftAssignmentModel.deleteMany({
                    _id: { $in: assignmentsToDelete.map(assignment => assignment._id) }
                });
            }

            // Chuẩn bị các ca trực mới để thêm hoặc cập nhật
            const bulkOperations = receivedAssignments.map(assignment => {
                const key = `${assignment.doctorId}-${assignment.shiftId}-${assignment.date}`;

                if (!existingKeys.includes(key)) {
                    return {
                        insertOne: {
                            document: {
                                user: assignment.doctorId,
                                shift: assignment.shiftId,
                                date: assignment.date
                            }
                        }
                    };
                }
                return null;
            }).filter(Boolean); // Loại bỏ các giá trị null

            // Thực hiện thêm hoặc cập nhật ca trực
            if (bulkOperations.length > 0) {
                await this.shiftAssignmentModel.bulkWrite(bulkOperations);
            }

            return { message: "Cập nhật ca trực thành công!" };
        }
    }



    async deleteShiftAssignment(listShiftAssignment: any[]): Promise<any[]> {
        const deletedShiftAssignment = await Promise.all(listShiftAssignment.map(async (shiftAssignment) => {
            const { shiftId, date } = shiftAssignment;
            return this.shiftAssignmentModel.deleteOne({ shift: shiftId, date: date });
        }));
        return deletedShiftAssignment;

    }

    async getShiftAssignmentByDoctorId(doctorId: string, filter: GetMyShiftsFilterDto) {
        const { month, year } = filter;
        // get shift assignment by doctorId of month and year
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);
        return this.shiftAssignmentModel
            .find({
                user: doctorId,
                date: {
                    $gte: startOfMonth.toISOString().split('T')[0],
                    $lte: endOfMonth.toISOString().split('T')[0],
                }
            })
            .populate('shift', 'name startTime endTime');
    }



    async shiftAssignmentChange(shiftChangeDataDto: ShiftChangeDataDto) {
        const { shiftAssignmentId, currentDoctorId, newDoctorId, date } = shiftChangeDataDto;

        try {
            // Kiểm tra ca làm việc có tồn tại không
            const shiftAssignment = await this.shiftAssignmentModel.findById(shiftAssignmentId);
            if (!shiftAssignment) {
                throw new Error('Shift assignment not found');
            }

            // Kiểm tra bác sĩ hiện tại có thuộc ca này không
            if (shiftAssignment.user.toString() !== currentDoctorId) {
                throw new Error('Current doctor does not match the shift assignment');
            }

            // Cập nhật ca làm việc với bác sĩ mới
            const updateResult = await this.shiftAssignmentModel.updateOne(
                { _id: shiftAssignmentId },
                { user: newDoctorId, date: date }
            );

            if (updateResult.modifiedCount === 0) {
                throw new Error('Shift change update failed');
            }

            return { success: true, message: 'Shift assignment updated successfully' };
        } catch (error) {
            console.error('Shift assignment change error:', error.message);
            throw new Error(error.message);
        }
    }

}
