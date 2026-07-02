import { successErrorReturnDto } from 'src/dto/common.dto';
import {
  addCommentonIssueInputDto,
  createIssueInputDto,
} from 'src/dto/userissues.dto';

export function validateCreateIssueInput(
  input: createIssueInputDto,
  userId: number
): successErrorReturnDto {
  const trimmedExplanation = input?.explanation?.trim();
  const trimmedSubject = input?.subject?.trim();
  const trimmedUserid = userId;

  if (!trimmedExplanation) {
    return {
      error: {
        status: 422,
        message: 'Explanation cannot be empty.',
      },
    };
  }

  if (!trimmedSubject) {
    return {
      error: {
        status: 422,
        message: 'Subject cannot be empty.',
      },
    };
  }

  if (!trimmedUserid || typeof trimmedUserid !== 'number') {
    return {
      error: {
        status: 422,
        message: 'User ID must be a number.',
      },
    };
  }

  return { success: true };
}

export function validateAddCommentonIssueInput(
  input: addCommentonIssueInputDto,
  userId: number
): successErrorReturnDto {
  const trimmedComment = input?.comment?.trim();

  if (!userId) {
    return {
      error: {
        status: 422,
        message: 'User ID cannot be empty.',
      },
    };
  }

  if (!input?.issueId || typeof input?.issueId !== 'number') {
    return {
      error: {
        status: 422,
        message: 'Issue ID must be a number.',
      },
    };
  }

  if (!trimmedComment) {
    return {
      error: {
        status: 422,
        message: 'Comment cannot be empty.',
      },
    };
  }

  return { success: true };
}
