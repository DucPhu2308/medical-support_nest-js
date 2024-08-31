import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ActiveAccountDto } from './dtos/active-account.dto';
import { instanceToPlain, plainToClass, plainToInstance } from 'class-transformer';
import { UserResponse } from './dtos/user-response.dto';
import { ORG_NAME } from 'src/common/constances';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthService {
    
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService
    ) { }

    async verify(activeAccountDto: ActiveAccountDto) {
        const foundUser = await this.userModel.findOne({ email: activeAccountDto.email });
        if (!foundUser) {
            throw new HttpException('User not found', 404);
        }

        if (foundUser.activeCode !== activeAccountDto.activeCode) {
            throw new HttpException('Invalid active code', 400);
        }

        foundUser.isActive = true;
        await foundUser.save();

        return 'Success';
    }

    async forgotPassword(email: string) {
        const user = await this.userModel.findOne(
            { email: email },
        );
        
        if (!user) {
            throw new HttpException('User not found', 404);
        }

        user.activeCode = this.generateActiveCode();

        await user.save();

        // send email
        await this.mailerService.sendMail({
            to: user.email,
            subject: `[${ORG_NAME}] Đổi mật khẩu`,
            text: `Mã OTP của bạn là: ${user.activeCode}\n` +
                'Vui lòng nhập OTP cùng mật khẩu mới để đổi mật khẩu.',
        });

        return 'Success';
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const user = await this.userModel.findOne(
            { email: resetPasswordDto.email },
        );
        
        if (!user) {
            throw new HttpException('User not found', 404);
        }

        if (user.activeCode !== resetPasswordDto.activeCode) {
            throw new HttpException('Invalid active code', 400);
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(resetPasswordDto.password, salt);
        user.activeCode = '';

        await user.save();

        return 'Success';
    }

    async login(loginDto: LoginDto) {
        const user = await this.userModel.findOne({
            email: loginDto.email,
        });

        if (!user) {
            throw new HttpException('Invalid credentials', 401);
        }

        const isMatch = await bcrypt.compare(loginDto.password, user.password);
        if (!isMatch) {
            throw new HttpException('Invalid credentials', 401);
        }

        if (!user.isActive) {
            throw new HttpException('Account is not active', 400);
        }
        const userRes = new UserResponse(user);
        const token = this.jwtService.sign({
            sub: userRes._id,
            email: userRes.email
        });

        return { user: userRes, token };
    }

    async register(registerDto: RegisterDto) {
        const foundUser = await this.userModel.findOne({ email: registerDto.email });
        if (foundUser) {
            throw new HttpException('User already exists', 400);
        }

        const user = new this.userModel(registerDto);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        user.activeCode = this.generateActiveCode();
        user.isActive = false;
        
        const result = await this.userModel.create(user);


        // send email
        await this.mailerService.sendMail({
            to: user.email,
            subject: `[${ORG_NAME}] Kích hoạt tài khoản`,
            text: `Mã kích hoạt của bạn là: ${user.activeCode}`,
        });

        // convert to UserResponse
        return new UserResponse(result);
    }

    // generate a random 6-digit number
    generateActiveCode() {
        const random = Math.floor(100000 + Math.random() * 900000);
        return random.toString();
    }

    // generate a random string with n characters
    generateTempPassword(n: number) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*()_+-={}[]|;:,.<>?';
        let tempPassword = '';
        for (let i = 0; i < n; i++) {
            tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return tempPassword;
    }

}
