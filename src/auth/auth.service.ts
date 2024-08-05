import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly jwtService: JwtService
    ) {}

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

        user.password = undefined;
        const token = this.jwtService.sign(user.toJSON());

        return { user, token };
    }

    async register(registerDto: RegisterDto) {
        const foundUser = await this.userModel.findOne({ email: registerDto.email });
        if (foundUser) {
            throw new HttpException('User already exists', 400);
        }

        const user = new this.userModel(registerDto);
        user.createdAt = new Date();

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        // user.activeCode = this.generateActiveCode();
        
        // exclude password from response
        const result = await this.userModel.create(user);
        result.password = undefined;
        return result;
    }

    generateActiveCode() {
        const random = Math.floor(100000 + Math.random() * 900000);
        return random.toString();
    }
}
