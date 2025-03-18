import { Module } from "@nestjs/common";
import { AdminAccountsController } from "./adminaccounts.controller";
import { AdminAccountsService } from "./adminaccounts.service";

@Module({
    controllers:[AdminAccountsController],
    providers: [AdminAccountsService]
})
export class AdminAccountsModule{}