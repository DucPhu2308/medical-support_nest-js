import { Module } from '@nestjs/common';
import { TypeDrugController } from './type-drug.controller';
import { TypeDrugService } from './type-drug.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeDrug, TypeDrugSchema } from 'src/schemas/typeDrug.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TypeDrug.name, schema: TypeDrugSchema }
    ]),
  ],
  controllers: [TypeDrugController],
  providers: [TypeDrugService]
})
export class TypeDrugModule {}
