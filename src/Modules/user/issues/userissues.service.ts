import { Injectable, Logger } from '@nestjs/common';
import { successErrorReturnDto } from 'src/dto/common.dto';
import {
  addCommentonIssueInputDto,
  createIssueInputDto,
  getIssueDetailsQueryDto,
} from 'src/dto/userissues.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { getTxnId } from 'src/utils/uuid.utils';
import { validateAddCommentonIssueInput, validateCreateIssueInput } from 'src/validations/userissues.validation';

@Injectable()
export class UserIssuesServices {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(UserIssuesServices.name);

  async getAllActiveIssues(userId: string) {
    try {
      const data = await this.prismaService.userissues.findMany({
        where: { status: 'ACTIVE', userid: userId },
        select: { issueId: true, subject: true, status: true },
      });
      if (!data) {
        return { error: { status: 404, message: 'No active issues' } };
      }
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getIssueDetails(issueIdQuery: getIssueDetailsQueryDto) {
    try {
      if (!issueIdQuery || !issueIdQuery.issueId) {
        return { error: { status: 422, message: 'issue id is required' } };
      }
      const data = await this.prismaService.userissues.findUnique({
        where: { issueId: issueIdQuery.issueId },
        select: {
          id: true,
          screenshots: true,
          created: true,
          resolvedBy: true,
          status: true,
          subject: true,
          explanation: true,
          User: { select: { firstname: true, isCompanion: true } },
          comments: {
            select: {
              screenshots: true,
              comment: true,
              created: true,
              User: { select: { firstname: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      if (!data) {
        return { error: { status: 404, message: 'Issue not valid!' } };
      }
      const converted = {
        ...data,
        created: String(data.created),
        comments: data.comments.map((l) => ({
          ...l,
          User: {
            firstname: l.User.firstname,
            isAdmin: l.User.role === 'ADMIN',
          },
          created: String(l.created),
        })),
      };
      return { data: converted };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async createUserIssue(
    issueinput: createIssueInputDto,
    images: Express.Multer.File[],
    userId: string,
  ): Promise<successErrorReturnDto> {
    try {
      const { error } = validateCreateIssueInput(issueinput, userId);
      if (error) {
        return { error };
      }
      const allimages = images.map((l) => l.destination + '/' + l.filename);
      const data = await this.prismaService.userissues.create({
        data: {
          screenshots: allimages,
          explanation: issueinput.explanation,
          subject: issueinput.subject,
          User: { connect: { id: userId } },
          created: Date.now(),
          issueId: getTxnId(),
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async addCommentonIssue(
    commentInput: addCommentonIssueInputDto,
    userId: string
  ): Promise<successErrorReturnDto> {
    try {
      const { error } = validateAddCommentonIssueInput(commentInput, userId);
      if (error) {
        return { error };
      }
      const data = await this.prismaService.issuescomments.create({
        data: {
          comment: commentInput.comment,
          User: { connect: { id: userId } },
          UserIssue: { connect: { id: commentInput.issueId } },
          created: Date.now(),
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
