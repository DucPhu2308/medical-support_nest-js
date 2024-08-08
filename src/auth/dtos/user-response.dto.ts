import { Expose } from "class-transformer";
import { User, UserDocument } from "src/schemas/user.schema";

export class UserResponse {
    constructor(user: UserDocument) {
        this._id = user._id.toHexString();
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.dob = user.dob;
        this.gender = user.gender;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.isActive = user.isActive;
    }
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    dob: Date;
    gender: boolean;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}