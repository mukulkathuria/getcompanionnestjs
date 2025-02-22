import { successErrorReturnDto } from 'src/dto/common.dto';
import {
  addCommentonIssueInputDto,
  createIssueInputDto,
} from 'src/dto/userissues.dto';

export function validateCreateIssueInput(
  input: createIssueInputDto,
  userId: string
): successErrorReturnDto {
  const trimmedExplanation = input?.explanation?.trim();
  const trimmedSubject = input?.subject?.trim();
  const trimmedUserid = userId?.trim();

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

  if (!trimmedUserid) {
    return {
      error: {
        status: 422,
        message: 'User ID cannot be empty.',
      },
    };
  }

  return { success: true };
}

export function validateAddCommentonIssueInput(
  input: addCommentonIssueInputDto,
  userId: string
): successErrorReturnDto {
  const trimmedUserId = userId.trim();
  const trimmedIssueId = input?.issueId?.trim();
  const trimmedComment = input?.comment?.trim();

  if (!trimmedUserId) {
    return {
      error: {
        status: 422,
        message: 'User ID cannot be empty.',
      },
    };
  }

  if (!trimmedIssueId) {
    return {
      error: {
        status: 422,
        message: 'Issue ID cannot be empty.',
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
