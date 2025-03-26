import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ShiftSegmentService } from './shift-segment.service';
import { ApiTags } from '@nestjs/swagger';
import { GetShiftSegmentDto } from './dtos/get-shift-segment.dto';
import { CreateShiftSegmentDto } from './dtos/create-shift-segment.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/shift-segment')
@ApiTags('shift-segment')
export class ShiftSegmentController {
    constructor(
        private readonly shiftSegmentService: ShiftSegmentService
    ) { }

    @Get("/all")
    async getAllShiftSegments() {
        return this.shiftSegmentService.getAllShiftSegments();
    }

    @Get("/getShiftSegmentByDoctor")
    async getByDoctor( @Query('doctor') doctor: string, @Query('date') date: string) {
        return await this.shiftSegmentService.getShiftSegmentByDoctor({ doctor, date });
        
    }

    @Post("/createShiftSegment")
    @UseGuards(AuthGuard)
    async createShiftSegment(@Body() createShiftSegmentDto: CreateShiftSegmentDto | CreateShiftSegmentDto[]) {
        return await this.shiftSegmentService.createShiftSegment(createShiftSegmentDto);
    }

    @Put("/updateMaxRegistrations")
    @UseGuards(AuthGuard)
    async updateMaxRegister(@Query('id') id: string, @Query('maxRegister') maxRegister: number) {
        return await this.shiftSegmentService.updateMaxRegistrations(id, maxRegister);
    }


    @Delete("/deleteShiftSegment/:id")
    @UseGuards(AuthGuard)
    async deleteShiftSegment(@Query('id') id: string) {
        return await this.shiftSegmentService.deleteShiftSegment(id);
    }
}
