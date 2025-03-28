import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ShiftAssignmentService } from './shift-assignment.service';
import { CreateShiftAssignmentDto } from './dtos/create-shift-assignment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetShiftAssignmentDto } from './dtos/get-shift-assignment.dto';
import { ShiftAssignment } from 'src/schemas/shiftAssignment.schema';
import { GetMyShiftsFilterDto } from './dtos/get-my-shifts-filter.dto';
import { ShiftChangeDataDto } from './dtos/shift-change-data.dto';

@Controller('/api/shift-assignment')
@ApiTags('shift-assignment')
@ApiBearerAuth()
export class ShiftAssignmentController {
    constructor(
        private readonly shiftAssignmentService: ShiftAssignmentService
    ){}

    @Get('/all')
    @UseGuards(AuthGuard)
    async getShiftAssignments(@Request() req, @Query() getShiftAssignmentDto: GetShiftAssignmentDto) {
        return this.shiftAssignmentService.getShiftAssignments(getShiftAssignmentDto);
    }

    @Get('/all/by-doctor-expect/:doctorId')
    @UseGuards(AuthGuard)
    async getShiftAssignmentsByDoctor(@Request() req, @Param('doctorId') doctorId: string) {
        return this.shiftAssignmentService.getShiftAssignmentsByDoctorExpect(doctorId, req.user.sub);
    }
   

    @Post('/create')
    @UseGuards(AuthGuard)
    async createShiftAssignment(@Request() req, @Body()createShiftAssignmentDto: CreateShiftAssignmentDto | CreateShiftAssignmentDto[]) {
        return this.shiftAssignmentService.createShiftAssignment(createShiftAssignmentDto);
    }


    @Delete('/delete')
    @UseGuards(AuthGuard)
    async deleteShiftAssignment(@Request() req, @Body()shiftAssignmentDto : any[]) {
        return this.shiftAssignmentService.deleteShiftAssignment(shiftAssignmentDto);
    }

    @Get('/my-shifts')
    @UseGuards(AuthGuard)
    async getShiftAssignmentsByDoctorId(@Request() req, @Query() filter: GetMyShiftsFilterDto) {
        return this.shiftAssignmentService.getShiftAssignmentByDoctorId(req.user.sub, filter);
    }


    @Post('/change-shift')
    @UseGuards(AuthGuard)
    async changeShift(@Body() shiftChangeData: ShiftChangeDataDto) {
        return this.shiftAssignmentService.shiftAssignmentChange(shiftChangeData);
    }
}
