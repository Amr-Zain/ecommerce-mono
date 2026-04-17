import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {
  constructor(private readonly prismaService: PrismaService) {
    this.prismaService.user.findFirst({
      where: {
        id: 1,
      },
    }); 
  }
}
