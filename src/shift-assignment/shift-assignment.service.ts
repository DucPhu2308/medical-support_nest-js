import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftAssignment } from 'src/schemas/shiftAssignment.schema';
import { CreateShiftAssignmentDto } from './dtos/create-shift-assignment.dto';
import { GetShiftAssignmentDto } from './dtos/get-shift-assignment.dto';
import { DeleteShiftAssignmentDto } from './dtos/delete-shift-assignment.dto';

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


    async createShiftAssignment(createShiftAssignmentDto: CreateShiftAssignmentDto | CreateShiftAssignmentDto[]) {
        if (Array.isArray(createShiftAssignmentDto)) {
            const receivedAssignments = createShiftAssignmentDto;
            const receivedKeys = receivedAssignments.map(assignment =>
                `${assignment.doctorId}-${assignment.shiftId}-${assignment.date}`
            );
            const receivedDates = [...new Set(receivedAssignments.map(assignment => assignment.date))];

            // Lấy tất cả các ca trực từ cơ sở dữ liệu theo ngày
            const existingAssignments = await this.shiftAssignmentModel.find({
                date: { $in: receivedDates }
            });

            const existingKeys = existingAssignments.map(assignment =>
                `${assignment.user}-${assignment.shift}-${assignment.date}`
            );

            // Lọc các ca trực cần xóa
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


            // Lấy tất cả các ngày trong tháng từ danh sách Dto
            const allDatesInMonth = new Set(receivedAssignments.map(a => a.date.substring(0, 7)));

            // Tìm các ngày không có trong danh sách được truyền vào
            const remainingAssignments = await this.shiftAssignmentModel.find({
                date: { $regex: `^(${Array.from(allDatesInMonth).join('|')})` }
            });

            const datesToDelete = remainingAssignments.filter(assignment => !receivedDates.includes(assignment.date));

            // Xóa các ca trực trong những ngày không tồn tại trong Dto
            if (datesToDelete.length > 0) {
                await this.shiftAssignmentModel.deleteMany({
                    _id: { $in: datesToDelete.map(assignment => assignment._id) }
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
}
