import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ShiftChangeService } from './shift-change.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateRequestShiftChangeDto } from './dtos/create-request-shift-change.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/shift-change')
@ApiTags('shift-change')
export class ShiftChangeController {
    constructor(
        private readonly shiftChangeService: ShiftChangeService
    ) { }

    @Get("/all")
    async getAllShiftChanges() {
        return this.shiftChangeService.getAllShiftChanges();
    }


    @Post("/createRequestShiftChange")
    @UseGuards(AuthGuard)
    async createRequestShiftChange(@Body() createRequestShiftChangeDto: CreateRequestShiftChangeDto) {
        return await this.shiftChangeService.createRequestShiftChange(createRequestShiftChangeDto);
    }
}
