export interface statusUpdateInputDto {
    id: string;
    approve?: boolean;
    reject?: boolean;
}

export interface updateCompanionPriceInputDto {
    updatedprice: number;
}