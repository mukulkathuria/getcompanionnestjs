import { Module } from "@nestjs/common";
import { CompanionController } from "./companion.controller";
import { CompanionService } from "./companion.service";
import { S3Service } from "src/Services/s3.service";

@Module({
    controllers: [CompanionController],
    providers:[CompanionService, S3Service]
})
export class AdminCompanionModule {}