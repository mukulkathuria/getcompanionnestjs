import { Module } from "@nestjs/common";
import { UserTasksService } from "./usertaks.service";

@Module({
    imports: [UserTasksService],
  })
  export class TaskModule {}
  