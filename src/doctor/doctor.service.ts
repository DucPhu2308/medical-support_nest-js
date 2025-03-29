import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { DoctorInfo } from "src/schemas/doctor-info.schema";
import { User, UserRole } from "src/schemas/user.schema";
import { CreateDoctorDto } from "./dtos/create-doctor.dto";
import { create } from "domain";
import * as bcrypt from 'bcrypt';
import { ORG_NAME } from 'src/common/constances';
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { FirebaseService, UploadFolder } from "src/firebase/firebase.service";
import { Speciality } from "src/schemas/speciality.schema";
import { PermissionDoctorDto } from "./dtos/permission-doctor.dto";
import { ShiftAssignment } from "src/schemas/shiftAssignment.schema";
import { GetDoctorHaveShiftDto } from "./dtos/get-doctor-have-shift.dto";
import { UpdateDoctorInfoDto } from "./dtos/update-doctorInfo.dto";

@Injectable()
export class DoctorService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(DoctorInfo.name) private doctorModel: Model<DoctorInfo>,
        @InjectModel(Speciality.name) private specialityModel: Model<Speciality>,
        @InjectModel(ShiftAssignment.name) private shiftAssignmentModel: Model<ShiftAssignment>,
        private readonly mailerService: MailerService,
        private readonly firebaseService: FirebaseService,
    ) { }

    async findAllDoctors() {
        return this.userModel.find({ roles: UserRole.DOCTOR })
            .select('firstName lastName email gender dob avatar doctorInfo')
            .populate('doctorInfo', 'specialities phone isPermission')
            .populate('doctorInfo.specialities', 'name');
    }

    async findDoctorBySpecialty(specialtyId: string) {
        const doctors = await this.userModel.find({ roles: UserRole.DOCTOR })
            .populate('doctorInfo', 'specialities phone isPermission')
            .populate('doctorInfo.specialities', 'name');

        return doctors.filter(doctor =>
            doctor.doctorInfo && doctor.doctorInfo.specialities.some(speciality => speciality._id.toString() === specialtyId)
        );

    }

    async findAllDoctorsHaveShift() {
        const doctors = await this.userModel.find({ roles: UserRole.DOCTOR })
            .select('firstName lastName email gender dob avatar doctorInfo')
            .populate('doctorInfo', 'specialities phone isPermission treatment description')
            .populate('doctorInfo.specialities', 'name');

        const today = new Date(new Date().toISOString().substring(0, 10));

        // dữ liệu trả về phải có dạng bác sĩ và ca trực 
        const doctorsWithShift = [];
        for (let i = 0; i < doctors.length; i++) {
            const doctor = doctors[i];
            const shiftAssignment = await this.shiftAssignmentModel.find({ user: doctor._id })
                .populate('shift', 'name startTime endTime');

            // Kiểm tra nếu có ít nhất một ca trực trong ngày hôm nay hoặc tương lai
            const hasValidShift = shiftAssignment.some(shift => new Date(shift.date) >= today);

            if (hasValidShift) {
                doctorsWithShift.push({
                    doctor: doctor,
                    shiftAssignment: shiftAssignment
                });
            }
        }

        return doctorsWithShift;
    }

    async findDoctorsHaveShift(GetDoctorHaveShiftDto: GetDoctorHaveShiftDto) {
        const { day, month, year, specialtyId } = GetDoctorHaveShiftDto;
        const today = new Date(new Date().toISOString().substring(0, 10));

        // Lấy danh sách bác sĩ
        const doctors = await this.userModel.find({ roles: UserRole.DOCTOR })
            .select('firstName lastName email gender dob avatar doctorInfo')
            .populate('doctorInfo', 'specialities phone isPermission treatment description')
            .populate('doctorInfo.specialities', 'name');

        // Xây dựng date dạng "YYYY-MM-DD"
        const date = new Date(Date.UTC(year, month - 1, day)).toISOString().substring(0, 10);

        // Lấy danh sách ca trực trong ngày
        const shiftAssignments = await this.shiftAssignmentModel.find({
            date: date,
        }).populate('user', 'firstName lastName email doctorInfo');

        // Lọc danh sách bác sĩ có ca trực
        let doctorsWithShift = doctors.filter(doctor =>
            shiftAssignments.some(shift => shift.user._id.toString() === doctor._id.toString())
        );

        // Nếu có specialtyId, lọc theo chuyên khoa
        if (specialtyId) {
            doctorsWithShift = doctorsWithShift.filter(doctor =>
                doctor.doctorInfo && doctor.doctorInfo.specialities.some(speciality => speciality._id.toString() === specialtyId)
            );
        }

        // Tạo danh sách bác sĩ với ca trực hợp lệ (>= hôm nay)
        return doctorsWithShift
            .map(doctor => {
                const assignedShifts = shiftAssignments.filter(shift =>
                    shift.user._id.toString() === doctor._id.toString() &&
                    new Date(shift.date) >= today
                );

                return assignedShifts.length > 0 ? { doctor, shiftAssignment: assignedShifts } : null;
            })
            .filter(entry => entry !== null); // Loại bỏ các bác sĩ không có ca trực hợp lệ
    }



    async createDoctor(createDoctorDto: CreateDoctorDto) {
        const currentDoctor = await this.userModel.findOne({ email: createDoctorDto.email });
        if (currentDoctor) {
            throw new Error('Doctor already exists');
        }

        const specialities = await this.specialityModel.findById(createDoctorDto.specialty);
        const doctorInfo = await this.doctorModel.create({
            specialities: [specialities._id],
            phone: createDoctorDto.phone,
            isPermission: false,
            treatment: createDoctorDto.treatment || null,
            description: createDoctorDto.description || null,
        });


        const newDoctorInfo = await doctorInfo.save();

        var password = this.autoCreatePassword();
        const newDoctor = {
            email: createDoctorDto.email,
            dob: createDoctorDto.dob,
            firstName: createDoctorDto.firstName,
            lastName: createDoctorDto.lastName,
            doctorInfo: {
                specialities: [specialities._id],
                phone: createDoctorDto.phone,
                isPermission: false,
                treatment: newDoctorInfo.treatment || null,
                description: newDoctorInfo.description || null,
            },
            gender: createDoctorDto.gender,
            isActive: true,
            roles: [UserRole.DOCTOR],
            password: await bcrypt.hash(password, 10),
            avatar: '',
            bio: '',

        };

        const file = createDoctorDto.avatar;
        if (file) {
            const avatar = await this.firebaseService.uploadFile(file, UploadFolder.POST);
            newDoctor.avatar = avatar;
        }

        const user = await this.userModel.create(newDoctor);
        await user.save();

        await this.mailerService.sendMail({
            to: createDoctorDto.email,
            subject: `[${ORG_NAME}] Tài khoản đã được cấp`,
            text: `Mật khẩu tài khoản: ${password}`,
        });

        return newDoctor;
    }

    autoCreatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }
        return password;
    }

    async updateDoctorPermission(permissionDoctorDto: PermissionDoctorDto) {
        const doctor = await this.userModel.findById(permissionDoctorDto.doctorId);
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        return this.userModel.findByIdAndUpdate(
            permissionDoctorDto.doctorId,
            {
                $set: {
                    'doctorInfo.isPermission': permissionDoctorDto.isPermission,
                },
            },
            { new: true },
        );

    }

    async updateDoctorInfo(doctorId: string, updateDoctorInfoDto: UpdateDoctorInfoDto) {
        const doctor = await this.userModel.findById(doctorId);
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        doctor.doctorInfo.treatment = updateDoctorInfoDto.treatment || doctor.doctorInfo.treatment;
        doctor.doctorInfo.description = updateDoctorInfoDto.description || doctor.doctorInfo.description;
        doctor.doctorInfo.phone = updateDoctorInfoDto.phone || doctor.doctorInfo.phone;

        const request= this.userModel.findByIdAndUpdate(
            doctorId,   
            {
                $set: {
                    'doctorInfo.treatment': doctor.doctorInfo.treatment,
                    'doctorInfo.description': doctor.doctorInfo.description,
                    'doctorInfo.phone': doctor.doctorInfo.phone,
                },
            },
            { new: true },
        ); 

        // chỉ lấy doctorInfo
        const updatedDoctor = await request.populate('doctorInfo', 'specialities phone isPermission treatment description')
            .populate('doctorInfo.specialities', 'name')
            .exec();

        return updatedDoctor.doctorInfo;
    }

}