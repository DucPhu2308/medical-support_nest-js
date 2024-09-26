import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { DoctorService } from "./doctor.service";
import { CreateDoctorDto } from "./dtos/create-doctor.dto";
import { AuthGuard } from "src/auth/auth.guard";




@Controller('/api/doctor')
@ApiTags('doctor')
@ApiBearerAuth()
export class DoctorController {
    constructor(private readonly doctorService: DoctorService) {}

    @Post()
    @UseGuards(AuthGuard)
    async createDoctor(@Request() req, @Body() createDoctorDto: CreateDoctorDto) {
        return this.doctorService.createDoctor(createDoctorDto);
    }

    // @Get()
    // async getDoctors() {
    //     return this.doctorService.getDoctors();
    // }

    // @Get("/:doctorId")
    // async getDoctorById(@Param('doctorId') doctorId: string) {
    //     return this.doctorService.getDoctorById(doctorId);
    // }

    // @Put("/:doctorId")
    // @UseGuards(AuthGuard)
    // async updateDoctor(@Request() req, @Param('doctorId') doctorId: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    //     return this.doctorService.updateDoctor(doctorId, updateDoctorDto);
    // }

    // @Delete("/:doctorId")
    // @UseGuards(AuthGuard)
    // async deleteDoctor(@Request() req, @Param('doctorId') doctorId: string) {
    //     return this.doctorService.deleteDoctor(doctorId);
    // }
}

