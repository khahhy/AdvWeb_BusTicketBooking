import { Module } from '@nestjs/common';
import { ETicketService } from './eticket.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ETicketService],
  exports: [ETicketService],
})
export class ETicketModule {}

