import { Injectable, Logger } from '@nestjs/common';
import {
  addCommentonIssueInputDto,
  createIssueInputDto,
} from 'src/dto/userissues.dto';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class UserIssuesServices {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(UserIssuesServices.name);

  async getAllActiveIssues(userId: string) {
    try {
      const data = await this.prismaService.userissues.findMany({
        where: { status: 'ACTIVE', userid: userId },
      });
      if (!data || !data.length) {
        return { error: { status: 404, message: 'No active issues' } };
      }
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getIssueDetails(issueId: string) {
    try {
      const data = await this.prismaService.userissues.findMany({
        where: { id: issueId },
        include: { comments: { orderBy: { createdAt: 'desc' } } },
      });
      if (!data) {
        return { error: { status: 404, message: 'Issue not valid!' } };
      }
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async createUserIssue(
    issueinput: createIssueInputDto,
    images: Express.Multer.File[],
  ) {
    try {
      const allimages = images.map((l) => l.destination + '/' + l.filename);
      const data = await this.prismaService.userissues.create({
        data: {
          screenshots: allimages,
          explanation: issueinput.explanation,
          subject: issueinput.subject,
          User: { connect: { id: issueinput.userid } },
        },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async addCommentonIssue(commentInput: addCommentonIssueInputDto) {
    try {
      // eslint-disable-next-line
      const data = await this.prismaService.issuescomments.create({
        data: {
          comment: commentInput.comment,
          User: { connect: { id: commentInput.issueId } },
          UserIssue: { connect: { id: commentInput.issueId } },
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
