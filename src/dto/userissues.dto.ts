export interface createIssueInputDto {
  explanation: string;
  subject: string;
  userid: Number;
}

export interface addCommentonIssueInputDto {
  userId: number;
  issueId: number;
  comment: string;
}
export interface getIssueDetailsQueryDto {
  issueId: string;
}
