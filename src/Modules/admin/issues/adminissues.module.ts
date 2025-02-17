import { Module } from "@nestjs/common";
import { AdminIssuesController } from "./adminissues.controller";
import { AdminIssuesServices } from "./adminissues.service";

@Module({
    controllers:[AdminIssuesController],
    providers: [AdminIssuesServices]
})
export class AdminIssuesModule{}