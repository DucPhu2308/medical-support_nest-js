import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('/api/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/find')
    async getUsers(@Query('email') email: string) {
        return this.userService.findOneByEmailContains(email);
    }
}
