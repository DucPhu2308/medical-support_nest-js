import { Expose } from "class-transformer";
import mongoose, { Types } from "mongoose";
import { DoctorInfo } from "src/schemas/doctor-info.schema";
import { User, UserDocument } from "src/schemas/user.schema";

export class UserResponse {
    constructor(user: User) {
        this._id = user._id;
        this.avatar = user.avatar;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.dob = user.dob;
        this.gender = user.gender;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.isActive = user.isActive;
        this.bio = user.bio;
        this.roles = user.roles;
        this.doctorInfo = user.doctorInfo;
    }
    _id: Types.ObjectId;
    avatar: string;
    firstName: string;
    lastName: string;
    email: string;
    dob: Date;
    gender: boolean;
    bio: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    roles: string[];
    doctorInfo: DoctorInfo;
}