import { User } from "@prisma/client";
import { errorDto } from "./common.dto";

export interface CompanionFindReturnDto extends errorDto{
    data?: User[]
}