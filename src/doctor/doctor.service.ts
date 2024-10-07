import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DoctorInfo } from "src/schemas/doctor-info.schema";
import { User, UserRole } from "src/schemas/user.schema";
import { CreateDoctorDto } from "./dtos/create-doctor.dto";
import { create } from "domain";
import * as bcrypt from 'bcrypt';
import { ORG_NAME } from 'src/common/constances';
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DoctorService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(DoctorInfo.name) private doctorModel: Model<DoctorInfo>,
        private readonly mailerService: MailerService
    ) { }

    async createDoctor(createDoctorDto: CreateDoctorDto) {
        const currentDoctor = await this.userModel.findOne({ email: createDoctorDto.email });
        if (currentDoctor) {
            throw new Error('Doctor already exists');
        }

        const doctorInfo = await this.doctorModel.create({
            phone: createDoctorDto.phone,
            specialty: createDoctorDto.specialty
        });

        var password = this.autoCreatePassword();

        const newDoctor = await this.userModel.create({
            email: createDoctorDto.email,
            dob: createDoctorDto.dob,
            firstName: createDoctorDto.firstName,
            lastName: createDoctorDto.lastName,
            doctorInfo: doctorInfo._id,
            isActive: true,
            roles:[UserRole.DOCTOR],
            password: await bcrypt.hash(password, 10)

        })

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

}