import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { hash } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogsService,
  ) {}

  async findAll(query: QueryUserDto) {
    try {
      const { page = 1, limit = 10, search, role } = query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: Prisma.UsersWhereInput = {
        AND: [
          role ? { role: role } : {},
          search
            ? {
                OR: [
                  { fullName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      };

      const [users, total] = await Promise.all([
        this.prisma.users.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },

          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            status: true,
            createdAt: true,
            _count: { select: { bookings: true } },
          },
        }),
        this.prisma.users.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        message: 'Fetched users successfully',
        data: users,
        meta: {
          total,
          page: Number(page),
          limit: Number(take),
          totalPages,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch users', {
        cause: err,
      });
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.users.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');
      return { message: 'Fetched user successfully', data: user };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async createAdmin(
    dto: CreateUserDto,
    userId: string,
    ip: string,
    userAgent: string,
  ) {
    try {
      const existing = await this.prisma.users.findUnique({
        where: { email: dto.email },
      });
      if (existing) throw new BadRequestException('Email already exists');

      if (dto.phoneNumber) {
        const phoneExist = await this.prisma.users.findUnique({
          where: { phoneNumber: dto.phoneNumber },
        });
        if (phoneExist)
          throw new BadRequestException('Phone number already exists');
      }

      let hashedPassword: string | null = null;
      if (dto.password) {
        hashedPassword = await hash(dto.password, 10);
      }

      const newUser = await this.prisma.users.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          phoneNumber: dto.phoneNumber ?? null,
          password: hashedPassword,
          authProvider: 'local',
          role: 'admin',
          status: 'active',
        },
      });

      await this.activityLogService.logAction({
        userId: userId,
        action: 'CREATE_ADMIN',
        entityType: 'Users',
        entityId: newUser.id,
        metadata: {
          userId: newUser.id,
          email: newUser.email,
        },
        ipAddress: ip,
        userAgent: userAgent,
      });

      return { message: 'Admin created successfully', data: newUser };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to create admin');
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    try {
      const user = await this.prisma.users.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');

      if (dto.email && dto.email !== user.email) {
        const exist = await this.prisma.users.findUnique({
          where: { email: dto.email },
        });
        if (exist) throw new BadRequestException('Email already in use');
      }

      if (
        dto.phoneNumber !== undefined &&
        dto.phoneNumber !== user.phoneNumber
      ) {
        if (dto.phoneNumber !== null) {
          const phoneExist = await this.prisma.users.findUnique({
            where: { phoneNumber: dto.phoneNumber },
          });
          if (phoneExist)
            throw new BadRequestException('Phone number already in use');
        }
      }

      const updatedUser = await this.prisma.users.update({
        where: { id },
        data: {
          fullName: dto.fullName ?? user.fullName,
          email: dto.email ?? user.email,
          phoneNumber:
            dto.phoneNumber === undefined ? user.phoneNumber : dto.phoneNumber,
        },
      });

      return { message: 'User updated successfully', data: updatedUser };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      )
        throw err;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async updateRole(
    id: string,
    dto: UpdateRoleDto,
    userId: string,
    ip: string,
    userAgent: string,
  ) {
    try {
      const user = await this.prisma.users.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');

      const updatedUser = await this.prisma.users.update({
        where: { id },
        data: { role: dto.role },
      });

      await this.activityLogService.logAction({
        userId: userId,
        action: 'UPDATE_ROLE_USER',
        entityType: 'Users',
        entityId: updatedUser.id,
        metadata: {
          userId: updatedUser.id,
          email: updatedUser.email,
        },
        ipAddress: ip,
        userAgent: userAgent,
      });

      return { message: 'User role updated successfully', data: updatedUser };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update role');
    }
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    userId: string,
    ip: string,
    userAgent: string,
  ) {
    try {
      const user = await this.prisma.users.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');

      const updatedUser = await this.prisma.users.update({
        where: { id },
        data: { status: dto.status },
      });

      await this.activityLogService.logAction({
        userId: userId,
        action: 'UPDARE_STATUS_USER',
        entityType: 'Users',
        entityId: updatedUser.id,
        metadata: {
          userId: updatedUser.id,
          status: updatedUser.status,
        },
        ipAddress: ip,
        userAgent: userAgent,
      });

      return { message: 'User status updated successfully', data: updatedUser };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update status');
    }
  }

  async remove(id: string, userId: string, ip: string, userAgent: string) {
    try {
      const user = await this.prisma.users.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');

      const deletedUser = await this.prisma.users.delete({ where: { id } });

      await this.activityLogService.logAction({
        userId: userId,
        action: 'DELETE_USER',
        entityType: 'Users',
        entityId: deletedUser.id,
        metadata: {
          userId: deletedUser.id,
        },
        ipAddress: ip,
        userAgent: userAgent,
      });

      return { message: 'User deleted successfully', data: deletedUser };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async getStats() {
    try {
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );

      // Total Users
      const totalUsers = await this.prisma.users.count();
      const totalUsersLastMonth = await this.prisma.users.count({
        where: { createdAt: { lt: startOfThisMonth } },
      });

      // New Users
      const newUsersThisMonth = await this.prisma.users.count({
        where: { createdAt: { gte: startOfThisMonth } },
      });
      const newUsersLastMonth = await this.prisma.users.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfThisMonth,
          },
        },
      });

      // Active Users (made a booking)
      const activeUsersThisMonth = await this.prisma.users.count({
        where: {
          bookings: {
            some: {
              createdAt: { gte: startOfThisMonth },
            },
          },
        },
      });

      const activeUsersLastMonth = await this.prisma.users.count({
        where: {
          bookings: {
            some: {
              createdAt: {
                gte: startOfLastMonth,
                lt: startOfThisMonth,
              },
            },
          },
        },
      });

      const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Number((((current - previous) / previous) * 100).toFixed(2));
      };

      return {
        message: 'Fetched user stats successfully',
        data: {
          total: {
            value: totalUsers,
            growth: calculateGrowth(totalUsers, totalUsersLastMonth),
          },
          newThisMonth: {
            value: newUsersThisMonth,
            growth: calculateGrowth(newUsersThisMonth, newUsersLastMonth),
          },
          active: {
            value: activeUsersThisMonth,
            growth: calculateGrowth(activeUsersThisMonth, activeUsersLastMonth),
          },
        },
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch user stats', {
        cause: err,
      });
    }
  }
}
