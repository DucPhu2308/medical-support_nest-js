import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SpectialityService } from './department.service';
import { create } from 'domain';
import { CreateSpecialityDto } from './dtos/create-department.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/api/department')
@ApiTags('department')
@ApiBearerAuth()
export class SpectialityController {
    constructor(
        private readonly spectialityService: SpectialityService
    ) { }
    
    @Get('/all')
    async getAllSpeciality() {
        return this.spectialityService.getAllSpeciality();
    }

    @Post('/create')
    @UseGuards(AuthGuard)
    async createSpeciality(@Request() req, @Body() createSpecialityDto: CreateSpecialityDto) {
        return this.spectialityService.createSpeciality(createSpecialityDto.name);
    }

    @Put('/update/:id')
    @UseGuards(AuthGuard)
    async updateSpeciality(@Request() req, @Param('id') id: string, @Body() createSpecialityDto: CreateSpecialityDto) {
        return this.spectialityService.updateSpeciality(id, createSpecialityDto.name);
    }

    @Delete('/delete/:id')
    @UseGuards(AuthGuard)
    async deleteSpeciality(@Request() req, @Param('id') id: string) {
        return this.spectialityService.deleteSpeciality(id);
    }
}
