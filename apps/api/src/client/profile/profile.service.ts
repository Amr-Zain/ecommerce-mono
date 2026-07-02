import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { USERS_REPOSITORY, IUsersRepository } from '@/common/interfaces';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateProfileDto, UpdateProfileImageDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepo: IUsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getProfile(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneCode: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        userType: true,
        addresses: true,
        loyaltyAccount: {
          include: {
            currentTier: {
              include: { translations: true },
            },
          },
        },
      },
    });
    const userWithMedia = user ? await this.usersRepo.findById(userId) : null;
    if (!userWithMedia) throw new NotFoundException('User not found');
    const { password: _, ...result } = userWithMedia as unknown as Record<string, unknown>;
    const tier = user?.loyaltyAccount?.currentTier
      ? {
          id: user.loyaltyAccount.currentTier.id.toString(),
          name:
            user.loyaltyAccount.currentTier.translations.find((translation) => translation.langId === 'en')?.name ||
            user.loyaltyAccount.currentTier.translations[0]?.name ||
            '',
          multiplier: Number(user.loyaltyAccount.currentTier.multiplier),
          minLifetimePoints: user.loyaltyAccount.currentTier.minLifetimePoints,
          color: user.loyaltyAccount.currentTier.color,
        }
      : null;
    return {
      ...result,
      ...user,
      loyaltyAccount: undefined,
      tier,
      loyalty: {
        availablePoints: user?.loyaltyAccount?.availablePoints ?? 0,
        pendingPoints: user?.loyaltyAccount?.pendingPoints ?? 0,
        lifetimePoints: user?.loyaltyAccount?.lifetimePoints ?? 0,
        tier,
      },
    };
  }

  async updateProfile(userId: bigint, dto: UpdateProfileDto) {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.phoneCode !== undefined) data.phoneCode = dto.phoneCode;

    return this.usersRepo.updateUser(userId, data);
  }

  async updateImage(userId: bigint, dto: UpdateProfileImageDto) {
    const mediaService = (
      this.usersRepo as unknown as {
        mediaService?: {
          attachTempMedia: (data: unknown) => Promise<void>;
          deleteByEntity: (model: string, id: bigint, collection?: string) => Promise<void>;
        };
      }
    ).mediaService;
    if (dto.image) {
      if (mediaService) {
        await mediaService.deleteByEntity('user', userId, 'avatar');
        await mediaService.attachTempMedia({
          model: 'user',
          attachHash: dto.image,
          modelId: userId.toString(),
        });
      }
    }
    return this.usersRepo.findByIdAndType(userId, 'client');
  }
}
