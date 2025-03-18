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

    async findAllDoctorsHaveShift() {
        const doctors = await this.userModel.find({ roles: UserRole.DOCTOR })
            .select('firstName lastName email gender dob avatar doctorInfo')
            .populate('doctorInfo', 'specialities phone isPermission')
            .populate('doctorInfo.specialities', 'name');
        
        // dữ liệu trả về phải có dạng bác sĩ và ca trực 
        const doctorsWithShift = [];
        for (let i = 0; i < doctors.length; i++) {
            const doctor = doctors[i];
            const shiftAssignment = await this.shiftAssignmentModel.findOne({ user: doctor._id })
                .populate('shift', 'name startTime endTime');
            if (shiftAssignment) {
                doctorsWithShift.push({
                    doctor: doctor,
                    shiftAssignment: shiftAssignment,
                    
                });
            }
        }
        return doctorsWithShift;

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
        });


        const newDoctorInfo = await doctorInfo.save();

        var password = this.autoCreatePassword();
        const newDoctor = {
            email: createDoctorDto.email,
            dob: createDoctorDto.dob,
            firstName: createDoctorDto.firstName,
            lastName: createDoctorDto.lastName,
            doctorInfo: {
                _id: newDoctorInfo._id,
                specialities: newDoctorInfo.specialities,
                phone: newDoctorInfo.phone,
                isPermission: newDoctorInfo.isPermission,
            },
            gender: createDoctorDto.gender,
            isActive: true,
            roles:[UserRole.DOCTOR],
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

        // await this.mailerService.sendMail({
        //     to: createDoctorDto.email,
        //     subject: `[${ORG_NAME}] Tài khoản đã được cấp`,
        //     text: `Mật khẩu tài khoản: ${password}`,
        // });

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

}