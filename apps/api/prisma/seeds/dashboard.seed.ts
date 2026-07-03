import { PrismaClient } from '../../node_modules/.prisma/client/index.js';
import * as bcrypt from 'bcrypt';

const customerSeeds = [
  {
    id: 7001n,
    name: 'Noura Saleh',
    email: 'dashboard.noura@example.com',
    countryId: 4001n,
    country: 'Saudi Arabia',
    city: 'Riyadh',
  },
  {
    id: 7002n,
    name: 'Faisal Omar',
    email: 'dashboard.faisal@example.com',
    countryId: 4001n,
    country: 'Saudi Arabia',
    city: 'Jeddah',
  },
  {
    id: 7003n,
    name: 'Mariam Ali',
    email: 'dashboard.mariam@example.com',
    countryId: 4002n,
    country: 'United Arab Emirates',
    city: 'Dubai',
  },
  {
    id: 7004n,
    name: 'Khaled Mansour',
    email: 'dashboard.khaled@example.com',
    countryId: 4003n,
    country: 'Egypt',
    city: 'Cairo',
  },
  {
    id: 7005n,
    name: 'Laila Youssef',
    email: 'dashboard.laila@example.com',
    countryId: 4001n,
    country: 'Saudi Arabia',
    city: 'Dammam',
  },
] as const;

const orderSeeds = [
  {
    id: 8001n,
    daysAgo: 0,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'cod',
    userIndex: 0,
    productId: 2001n,
    quantity: 1,
    unitPrice: 249,
  },
  {
    id: 8002n,
    daysAgo: 1,
    status: 'processing',
    paymentStatus: 'completed',
    paymentMethod: 'stripe_checkout',
    userIndex: 1,
    productId: 2007n,
    quantity: 1,
    unitPrice: 349,
  },
  {
    id: 8003n,
    daysAgo: 2,
    status: 'shipped',
    paymentStatus: 'completed',
    paymentMethod: 'stripe_intent',
    userIndex: 2,
    productId: 2008n,
    quantity: 1,
    unitPrice: 399,
  },
  {
    id: 8004n,
    daysAgo: 3,
    status: 'delivered',
    paymentStatus: 'completed',
    paymentMethod: 'bank_transfer',
    userIndex: 3,
    productId: 2002n,
    quantity: 2,
    unitPrice: 159,
  },
  {
    id: 8005n,
    daysAgo: 4,
    status: 'cancelled',
    paymentStatus: 'failed',
    paymentMethod: 'stripe_checkout',
    userIndex: 4,
    productId: 2003n,
    quantity: 1,
    unitPrice: 119,
  },
  {
    id: 8006n,
    daysAgo: 5,
    status: 'delivered',
    paymentStatus: 'completed',
    paymentMethod: 'cod',
    userIndex: 0,
    productId: 2004n,
    quantity: 1,
    unitPrice: 189,
  },
  {
    id: 8007n,
    daysAgo: 6,
    status: 'processing',
    paymentStatus: 'awaiting_confirmation',
    paymentMethod: 'bank_transfer',
    userIndex: 1,
    productId: 2005n,
    quantity: 1,
    unitPrice: 179,
  },
  {
    id: 8008n,
    daysAgo: 8,
    status: 'refunded',
    paymentStatus: 'refunded',
    paymentMethod: 'stripe_intent',
    userIndex: 2,
    productId: 2006n,
    quantity: 2,
    unitPrice: 139,
  },
  {
    id: 8009n,
    daysAgo: 10,
    status: 'delivered',
    paymentStatus: 'completed',
    paymentMethod: 'stripe_checkout',
    userIndex: 3,
    productId: 2009n,
    quantity: 1,
    unitPrice: 299,
  },
  {
    id: 8010n,
    daysAgo: 12,
    status: 'delivered',
    paymentStatus: 'completed',
    paymentMethod: 'cod',
    userIndex: 4,
    productId: 2012n,
    quantity: 1,
    unitPrice: 499,
  },
  {
    id: 8011n,
    daysAgo: 15,
    status: 'shipped',
    paymentStatus: 'completed',
    paymentMethod: 'stripe_checkout',
    userIndex: 0,
    productId: 2010n,
    quantity: 3,
    unitPrice: 49,
  },
  {
    id: 8012n,
    daysAgo: 18,
    status: 'cancelled',
    paymentStatus: 'expired',
    paymentMethod: 'stripe_intent',
    userIndex: 1,
    productId: 2011n,
    quantity: 2,
    unitPrice: 39,
  },
  {
    id: 8013n,
    daysAgo: 22,
    status: 'delivered',
    paymentStatus: 'completed',
    paymentMethod: 'bank_transfer',
    userIndex: 2,
    productId: 2001n,
    quantity: 1,
    unitPrice: 249,
  },
  {
    id: 8014n,
    daysAgo: 28,
    status: 'processing',
    paymentStatus: 'processing_payment',
    paymentMethod: 'stripe_checkout',
    userIndex: 3,
    productId: 2008n,
    quantity: 1,
    unitPrice: 399,
  },
  {
    id: 8015n,
    daysAgo: 35,
    status: 'delivered',
    paymentStatus: 'completed',
    paymentMethod: 'cod',
    userIndex: 4,
    productId: 2007n,
    quantity: 1,
    unitPrice: 349,
  },
] as const;

export async function seedDashboard(prisma: PrismaClient) {
  const password = await bcrypt.hash('password123', 10);
  const customers = [];

  for (const customer of customerSeeds) {
    const user = await prisma.user.upsert({
      where: { id: customer.id },
      update: {
        name: customer.name,
        email: customer.email,
        password,
        userType: 'client',
        isEmailVerified: true,
        isActive: true,
        settings: { language: customer.id % 2n === 0n ? 'ar' : 'en' },
      },
      create: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        password,
        userType: 'client',
        isEmailVerified: true,
        isActive: true,
        settings: { language: customer.id % 2n === 0n ? 'ar' : 'en' },
      },
    });
    customers.push(user);
  }

  const seedOrderIds = orderSeeds.map((order) => order.id);
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: seedOrderIds } } });
  await prisma.paymentTransaction.deleteMany({ where: { orderId: { in: seedOrderIds } } });
  await prisma.orderItem.deleteMany({ where: { orderId: { in: seedOrderIds } } });

  for (const seed of orderSeeds) {
    const customer = customers[seed.userIndex];
    const customerSeed = customerSeeds[seed.userIndex];
    const createdAt = dateDaysAgo(seed.daysAgo);
    const subtotal = seed.quantity * seed.unitPrice;
    const shippingFee = seed.status === 'cancelled' ? 0 : 25;
    const discountAmount = seed.id % 3n === 0n ? 20 : 0;
    const vatValue = Number(((subtotal - discountAmount) * 0.15).toFixed(2));
    const totalPrice = Number((subtotal + shippingFee + vatValue - discountAmount).toFixed(2));
    const product = await prisma.product.findUnique({
      where: { id: seed.productId },
      include: {
        translations: true,
        variants: { where: { isActive: true }, orderBy: [{ isDefault: 'desc' }, { id: 'asc' }], take: 1 },
      },
    });
    const variant = product?.variants[0];
    const productName = product?.translations.find((item) => item.langId === 'en')?.name ?? `Product ${seed.productId}`;

    await prisma.order.upsert({
      where: { id: seed.id },
      update: {
        userId: customer.id,
        countryId: customerSeed.countryId,
        countryNameSnapshot: customerSeed.country,
        cityNameSnapshot: customerSeed.city,
        shippingFee,
        subtotal,
        discountAmount,
        vatValue,
        vatType: 'percentage',
        totalPrice,
        status: seed.status,
        paymentMethod: seed.paymentMethod,
        paymentStatus: seed.paymentStatus,
        createdAt,
        updatedAt: createdAt,
        deliveredAt: seed.status === 'delivered' ? createdAt : null,
        cancelledAt: seed.status === 'cancelled' ? createdAt : null,
        cancelReason: seed.status === 'cancelled' ? 'Dashboard demo cancellation' : null,
        shippingAddressSnapshot: {
          id: `seed-${seed.id}`,
          address: `${customerSeed.city} demo address`,
          street_name: 'Main Street',
          building_number: '12',
          city: customerSeed.city,
          country: customerSeed.country,
        },
      },
      create: {
        id: seed.id,
        orderNumber: seed.id.toString(),
        userId: customer.id,
        countryId: customerSeed.countryId,
        countryNameSnapshot: customerSeed.country,
        cityNameSnapshot: customerSeed.city,
        shippingFee,
        subtotal,
        discountAmount,
        vatValue,
        vatType: 'percentage',
        totalPrice,
        status: seed.status,
        paymentMethod: seed.paymentMethod,
        paymentStatus: seed.paymentStatus,
        createdAt,
        updatedAt: createdAt,
        deliveredAt: seed.status === 'delivered' ? createdAt : null,
        cancelledAt: seed.status === 'cancelled' ? createdAt : null,
        cancelReason: seed.status === 'cancelled' ? 'Dashboard demo cancellation' : null,
        shippingAddressSnapshot: {
          id: `seed-${seed.id}`,
          address: `${customerSeed.city} demo address`,
          street_name: 'Main Street',
          building_number: '12',
          city: customerSeed.city,
          country: customerSeed.country,
        },
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: seed.id,
        productId: seed.productId,
        variantId: variant?.id,
        quantity: seed.quantity,
        unitPriceSnapshot: seed.unitPrice,
        productNameSnapshot: productName,
        variantInfoSnapshot: variant ? { sku: variant.sku } : {},
        totalPrice: subtotal,
        lineSubtotalSnapshot: subtotal,
        netLineTotal: subtotal - discountAmount,
        netUnitPrice: Number(((subtotal - discountAmount) / seed.quantity).toFixed(2)),
        vatShare: vatValue,
      },
    });

    await prisma.paymentTransaction.create({
      data: {
        orderId: seed.id,
        amount: totalPrice,
        paymentMethod: seed.paymentMethod,
        paymentStatus: seed.paymentStatus,
        transactionRef: `DASH-${seed.id}`,
        gatewayResponse: { seeded: true, status: seed.paymentStatus },
        paidAt: seed.paymentStatus === 'completed' ? createdAt : null,
        currency: 'SAR',
        createdAt,
        refundReason: seed.paymentStatus === 'refunded' ? 'Dashboard demo refund' : null,
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: seed.id,
        previousStatus: null,
        newStatus: seed.status,
        actorType: 'system',
        reason: 'Dashboard demo seed',
        metadata: { seeded: true },
        createdAt,
      },
    });
  }

  await seedDashboardReviews(prisma, customers);
  console.log('Dashboard demo analytics data created/updated');
}

async function seedDashboardReviews(prisma: PrismaClient, customers: Array<{ id: bigint }>) {
  const reviewTargets = [
    { productId: 2001n, rating: 5, comment: 'Dashboard demo review: excellent quality.' },
    { productId: 2007n, rating: 4, comment: 'Dashboard demo review: arrived quickly.' },
    { productId: 2008n, rating: 5, comment: 'Dashboard demo review: beautiful finish.' },
    { productId: 2002n, rating: 3, comment: 'Dashboard demo review: good value.' },
    { productId: 2012n, rating: 5, comment: 'Dashboard demo review: perfect gift.' },
  ] as const;

  for (const [index, review] of reviewTargets.entries()) {
    const user = customers[index % customers.length];
    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: review.productId,
        },
      },
      update: {
        rating: review.rating,
        comment: review.comment,
        isVerified: index !== 3,
        isActive: true,
        createdAt: dateDaysAgo(index + 1),
      },
      create: {
        userId: user.id,
        productId: review.productId,
        rating: review.rating,
        comment: review.comment,
        isVerified: index !== 3,
        isActive: true,
        createdAt: dateDaysAgo(index + 1),
      },
    });
  }
}

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10 + (days % 8), 15, 0, 0);
  return date;
}
