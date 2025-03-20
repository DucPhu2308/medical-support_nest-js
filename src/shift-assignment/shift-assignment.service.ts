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
            if(getShiftAssignmentDto.doctorId) {
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
            const shiftAssignmentArray = await Promise.all(createShiftAssignmentDto.map(async (shiftAssignment) => {
                const existingAssignment = await this.shiftAssignmentModel.findOne({
                    shift: shiftAssignment.shiftId,
                    date: shiftAssignment.date
                });
    
                if (existingAssignment) {
                    if (shiftAssignment.doctorId === "") {
                        // Nếu không có người trực, xóa ca trực đó và trả về null để loại bỏ khỏi mảng insertMany
                        await this.shiftAssignmentModel.deleteOne({ _id: existingAssignment._id });
                        return null; 
                    } else {
                        // Cập nhật ca trực nếu đã tồn tại và có người trực
                        existingAssignment.user = new this.shiftAssignmentModel.base.Types.ObjectId(shiftAssignment.doctorId);
                        return existingAssignment.save();
                    }
                } else if (shiftAssignment.doctorId !== "") {
                    // Tạo mới nếu không tồn tại và có người trực
                    return {
                        shift: shiftAssignment.shiftId,
                        user: shiftAssignment.doctorId,
                        date: shiftAssignment.date
                    };
                }
                return null; // Bỏ qua nếu không có người trực
            }));
    
            // Lọc ra những ca hợp lệ để thêm vào DB
            const validShiftAssignments = shiftAssignmentArray.filter(item => item && !(item instanceof this.shiftAssignmentModel));
            
            // Chỉ insert những ca hợp lệ
            if (validShiftAssignments.length > 0) {
                return this.shiftAssignmentModel.insertMany(validShiftAssignments);
            }
            
            return []; // Trả về mảng rỗng nếu không có ca hợp lệ nào để thêm
        } else {
            // Xử lý trường hợp truyền vào là một đối tượng duy nhất
            const { shiftId, doctorId, date } = createShiftAssignmentDto;
    
            const existingAssignment = await this.shiftAssignmentModel.findOne({
                shift: shiftId,
                date: date
            });
    
            if (existingAssignment) {
                if (doctorId === "") {
                    // Nếu không có người trực, xóa ca trực đó
                    await this.shiftAssignmentModel.deleteOne({ _id: existingAssignment._id });
                    return null;
                } else {
                    // Cập nhật ca trực nếu đã tồn tại và có người trực
                    existingAssignment.user = new this.shiftAssignmentModel.base.Types.ObjectId(doctorId);
                    return existingAssignment.save();
                }
            } else if (doctorId !== "") {
                // Tạo mới nếu không tồn tại và có người trực
                return this.shiftAssignmentModel.create({
                    shift: shiftId,
                    user: doctorId,
                    date: date
                });
            }
    
            return null; // Trả về null nếu không có người trực
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
