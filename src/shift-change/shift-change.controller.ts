import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
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

    @Get("/all/doctor/:doctorId")
    async getShiftChangesByDoctor(@Param('doctorId') doctorId: string) {
        return this.shiftChangeService.getShiftChangeByUserId(doctorId);
    }


    @Post("/createRequestShiftChange")
    @UseGuards(AuthGuard)
    async createRequestShiftChange(@Body() createRequestShiftChangeDto: CreateRequestShiftChangeDto) {
        return await this.shiftChangeService.createRequestShiftChange(createRequestShiftChangeDto);
    }

    @Put("/updateRequestShiftChange/:id")
    @UseGuards(AuthGuard)
    async updateRequestShiftChange(@Param('id') id: string, @Body() createRequestShiftChangeDto: CreateRequestShiftChangeDto) {
        return await this.shiftChangeService.updateRequestShiftChange(id, createRequestShiftChangeDto);
    }


    @Delete("/deleteRequestShiftChange/:id")
    @UseGuards(AuthGuard)
    async deleteRequestShiftChange(@Param('id') id: string) {
        return await this.shiftChangeService.deleteRequestShiftChange(id);
    }
}
