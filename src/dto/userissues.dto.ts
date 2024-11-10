export interface createIssueInputDto {
    explanation: string;
    subject: string;
    userid: string;
}

export interface addCommentonIssueInputDto {
    userId: string;
    issueId: string;
    comment: string;
}