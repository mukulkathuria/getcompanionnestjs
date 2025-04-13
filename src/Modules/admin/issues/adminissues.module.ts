import { Module } from "@nestjs/common";
import { AdminIssuesController } from "./adminissues.controller";
import { AdminIssuesServices } from "./adminissues.service";
import { S3Service } from "src/Services/s3.service";

@Module({
    controllers:[AdminIssuesController],
    providers: [AdminIssuesServices, S3Service]
})
export class AdminIssuesModule{}