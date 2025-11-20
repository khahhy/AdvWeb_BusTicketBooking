import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const users = await this.prisma.users.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return { message: 'Fetched all users successfully', data: users };
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

  async createAdmin(dto: CreateUserDto) {
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

  async updateRole(id: string, dto: UpdateRoleDto) {
    try {
      const user = await this.prisma.users.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');

      const updatedUser = await this.prisma.users.update({
        where: { id },
        data: { role: dto.role },
      });

      return { message: 'User role updated successfully', data: updatedUser };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update role');
    }
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    try {
      const user = await this.prisma.users.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');

      const updatedUser = await this.prisma.users.update({
        where: { id },
        data: { status: dto.status },
      });

      return { message: 'User status updated successfully', data: updatedUser };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update status');
    }
  }

  async remove(id: string) {
    try {
      const user = await this.prisma.users.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');

      const deletedUser = await this.prisma.users.delete({ where: { id } });

      return { message: 'User deleted successfully', data: deletedUser };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
