import { Module } from "@nestjs/common";
import { UserTasksService } from "./usertaks.service";

@Module({
    providers: [UserTasksService],
  })
  export class TaskModule {}
  