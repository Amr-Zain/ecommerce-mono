import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class ClientOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: bigint) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { translations: true },
            },
            variant: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: bigint, id: bigint) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: { translations: true },
            },
            variant: true,
          },
        },
        address: true,
        payments: true,
      },
    });
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async create(userId: bigint, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (prisma) => {
      const orderItems = dto.items.map((item) => ({
        productId: BigInt(item.productId),
        variantId: item.variantId ? BigInt(item.variantId) : null,
        quantity: item.quantity,
        unitPriceSnapshot: 0,
        discountValueSnapshot: 0,
      }));

      if (dto.addressId) {
        const address = await prisma.address.findUnique({
          where: { id: BigInt(dto.addressId) },
        });
        if (!address || address.userId !== userId) {
          throw new NotFoundException('Address not found');
        }
      }

      const order = await prisma.order.create({
        data: {
          userId,
          addressId: dto.addressId ? BigInt(dto.addressId) : null,
          paymentMethod: dto.paymentMethod,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });
  }
}