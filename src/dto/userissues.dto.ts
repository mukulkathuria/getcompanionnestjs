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
export interface getIssueDetailsQueryDto {
  issueId: string;
}
