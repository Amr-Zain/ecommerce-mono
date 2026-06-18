"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
const bcrypt = __importStar(require("bcrypt"));
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL not found in environment');
}
const pool = new pg_1.default.Pool({ connectionString: databaseUrl });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const collectionSeeds = [
    {
        id: 1001n,
        slug: 'womens-jewellery',
        en: "Women's Jewellery",
        ar: 'مجوهرات نسائية',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=85',
    },
    {
        id: 1002n,
        slug: 'mens-jewellery',
        en: "Men's Jewellery",
        ar: 'مجوهرات رجالية',
        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=85',
    },
    {
        id: 1003n,
        slug: 'watches',
        en: 'Watches',
        ar: 'ساعات',
        image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=85',
    },
    {
        id: 1004n,
        slug: 'gifts',
        en: 'Gifts',
        ar: 'هدايا',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=85',
    },
];
const childCollectionSeeds = [
    { id: 1101n, parentId: 1001n, en: 'Necklaces', ar: 'قلادات' },
    { id: 1102n, parentId: 1001n, en: 'Rings & Earrings', ar: 'خواتم وأقراط' },
    { id: 1103n, parentId: 1002n, en: 'Men Rings', ar: 'خواتم رجالية' },
    { id: 1104n, parentId: 1002n, en: 'Men Bracelets', ar: 'أساور رجالية' },
    { id: 1105n, parentId: 1003n, en: 'Classic Watches', ar: 'ساعات كلاسيكية' },
    { id: 1106n, parentId: 1004n, en: 'Gift Sets', ar: 'أطقم هدايا' },
];
const leafCollectionSeeds = [
    { id: 1301n, parentId: 1101n, en: 'Pendant Necklaces', ar: 'Pendant Necklaces' },
    { id: 1302n, parentId: 1101n, en: 'Chain Necklaces', ar: 'Chain Necklaces' },
    { id: 1303n, parentId: 1102n, en: "Women's Rings", ar: "Women's Rings" },
    { id: 1304n, parentId: 1102n, en: 'Earrings', ar: 'Earrings' },
    { id: 1305n, parentId: 1103n, en: 'Signet Rings', ar: 'Signet Rings' },
    { id: 1306n, parentId: 1104n, en: 'Chain Bracelets', ar: 'Chain Bracelets' },
    { id: 1307n, parentId: 1105n, en: 'Metal Watches', ar: 'Metal Watches' },
    { id: 1308n, parentId: 1105n, en: 'Leather Watches', ar: 'Leather Watches' },
    { id: 1309n, parentId: 1106n, en: 'Jewellery Gifts', ar: 'Jewellery Gifts' },
    { id: 1310n, parentId: 1106n, en: 'Accessory Gifts', ar: 'Accessory Gifts' },
];
const attributeSeeds = [
    {
        id: 1201n,
        en: 'Finish',
        ar: 'اللون',
        values: [
            { id: 1211n, en: 'Silver', ar: 'فضي' },
            { id: 1212n, en: 'Gold', ar: 'ذهبي' },
            { id: 1213n, en: 'Black', ar: 'أسود' },
        ],
    },
    {
        id: 1202n,
        en: 'Size',
        ar: 'المقاس',
        values: [
            { id: 1221n, en: 'Small', ar: 'صغير' },
            { id: 1222n, en: 'Medium', ar: 'متوسط' },
            { id: 1223n, en: 'Large', ar: 'كبير' },
        ],
    },
];
const productSeeds = [
    [
        'Moonlight Silver Necklace',
        'قلادة فضية مون لايت',
        1001n,
        249,
        299,
        18,
        'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=700&q=85',
    ],
    [
        'Classic Zircon Ring',
        'خاتم زركون كلاسيكي',
        1001n,
        159,
        199,
        24,
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=85',
    ],
    [
        'Pearl Drop Earrings',
        'أقراط لؤلؤ متدلية',
        1001n,
        119,
        149,
        30,
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=85',
    ],
    [
        'Royal Silver Bracelet',
        'سوار فضي ملكي',
        1001n,
        189,
        229,
        15,
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=700&q=85',
    ],
    [
        'Onyx Signet Ring',
        'خاتم أونيكس رجالي',
        1002n,
        179,
        219,
        20,
        'https://images.unsplash.com/photo-1603561596112-db1d7d140b8c?auto=format&fit=crop&w=700&q=85',
    ],
    [
        'Minimal Chain Bracelet',
        'سوار سلسلة بسيط',
        1002n,
        139,
        169,
        22,
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=700&q=85',
    ],
    [
        'Midnight Steel Watch',
        'ساعة ميدنايت ستيل',
        1003n,
        349,
        429,
        12,
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=85',
    ],
    [
        'Rose Gold Watch',
        'ساعة روز جولد',
        1003n,
        399,
        479,
        10,
        'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=700&q=85',
    ],
    [
        'Everyday Leather Watch',
        'ساعة جلد يومية',
        1003n,
        299,
        349,
        16,
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=700&q=85',
    ],
    [
        'Premium Gift Box',
        'صندوق هدايا فاخر',
        1004n,
        49,
        null,
        100,
        'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=700&q=85',
    ],
    [
        'Silver Jewellery Care Set',
        'طقم العناية بالمجوهرات',
        1004n,
        39,
        null,
        80,
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=700&q=85',
    ],
    [
        'Elegant Celebration Set',
        'طقم احتفال أنيق',
        1004n,
        499,
        599,
        8,
        'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=700&q=85',
    ],
];
const variantCounts = [3, 7, 4, 6, 2, 8, 5, 3, 9, 1, 6, 4];
const variantCombinations = [
    [1211n, 1221n],
    [1212n, 1222n],
    [1213n, 1223n],
    [1211n, 1223n],
    [1212n, 1221n],
    [1213n, 1222n],
    [1213n, 1221n],
    [1211n, 1222n],
    [1212n, 1223n],
];
const variantGalleryImages = [
    'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=85',
];
const reviewSeeds = [
    {
        name: 'Sara Ahmed',
        email: 'reviewer.sara@example.com',
        rating: 5,
        comment: 'Beautiful finish and even better in person.',
    },
    {
        name: 'Omar Hassan',
        email: 'reviewer.omar@example.com',
        rating: 4,
        comment: 'Excellent quality and the size was accurate.',
    },
    {
        name: 'Lina Khaled',
        email: 'reviewer.lina@example.com',
        rating: 3,
        comment: 'Lovely design, though delivery took longer than expected.',
    },
    {
        name: 'Maya Adel',
        email: 'reviewer.maya@example.com',
        rating: 5,
        comment: 'A polished piece that feels made to last.',
    },
    {
        name: 'Youssef Ali',
        email: 'reviewer.youssef@example.com',
        rating: 4,
        comment: 'Matches the photos and arrived carefully packed.',
    },
];
async function upsertMedia(uuid, model, modelId, collection, path, isMain = true) {
    await prisma.media.upsert({
        where: { uuid },
        update: { model, modelId, collection, path, isMain },
        create: {
            uuid,
            model,
            modelId,
            collection,
            isMain,
            path,
            filename: `${model}-${modelId}.jpg`,
            originalName: `${model}-${modelId}.jpg`,
            extension: 'jpg',
            mimeType: 'image/jpeg',
            type: 'image',
            size: 100_000,
        },
    });
}
async function seedStorefront() {
    for (const [index, collection] of collectionSeeds.entries()) {
        await prisma.collection.upsert({
            where: { id: collection.id },
            update: { slug: collection.slug, isActive: true, sortOrder: index + 1 },
            create: { id: collection.id, slug: collection.slug, isActive: true, sortOrder: index + 1 },
        });
        for (const translation of [
            { langId: 'en', name: collection.en },
            { langId: 'ar', name: collection.ar },
        ]) {
            await prisma.collectionTranslation.upsert({
                where: { recordId_langId: { recordId: collection.id, langId: translation.langId } },
                update: { name: translation.name },
                create: { recordId: collection.id, ...translation },
            });
        }
        await upsertMedia(`10000000-0000-4000-8000-${collection.id.toString().padStart(12, '0')}`, 'collection', collection.id, 'collection', collection.image);
    }
    for (const [index, collection] of [...childCollectionSeeds, ...leafCollectionSeeds].entries()) {
        const slug = collection.en
            .toLowerCase()
            .replace(/&/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        await prisma.collection.upsert({
            where: { id: collection.id },
            update: { slug, parentId: collection.parentId, isActive: true, sortOrder: index + 1 },
            create: {
                id: collection.id,
                slug,
                parentId: collection.parentId,
                isActive: true,
                sortOrder: index + 1,
            },
        });
        for (const translation of [
            { langId: 'en', name: collection.en },
            { langId: 'ar', name: collection.ar },
        ]) {
            await prisma.collectionTranslation.upsert({
                where: { recordId_langId: { recordId: collection.id, langId: translation.langId } },
                update: { name: translation.name },
                create: { recordId: collection.id, ...translation },
            });
        }
    }
    for (const attribute of attributeSeeds) {
        await prisma.attribute.upsert({
            where: { id: attribute.id },
            update: {},
            create: { id: attribute.id },
        });
        for (const translation of [
            { langId: 'en', name: attribute.en },
            { langId: 'ar', name: attribute.ar },
        ]) {
            await prisma.attributeTranslation.upsert({
                where: { recordId_langId: { recordId: attribute.id, langId: translation.langId } },
                update: { name: translation.name },
                create: { recordId: attribute.id, ...translation },
            });
        }
        for (const value of attribute.values) {
            await prisma.attributeValue.upsert({
                where: { id: value.id },
                update: { attributeId: attribute.id, isActive: true },
                create: { id: value.id, attributeId: attribute.id, isActive: true },
            });
            for (const translation of [
                { langId: 'en', name: value.en },
                { langId: 'ar', name: value.ar },
            ]) {
                await prisma.attributeValueTranslation.upsert({
                    where: { recordId_langId: { recordId: value.id, langId: translation.langId } },
                    update: { name: translation.name },
                    create: { recordId: value.id, ...translation },
                });
            }
        }
    }
    const productCollections = [1301n, 1303n, 1304n, 1302n, 1305n, 1306n, 1307n, 1307n, 1308n, 1310n, 1310n, 1309n];
    for (const [index, product] of productSeeds.entries()) {
        const [en, ar, _collectionId, price, compareAtPrice, stock, image] = product;
        const collectionId = productCollections[index];
        const id = BigInt(2001 + index);
        await prisma.product.upsert({
            where: { id },
            update: { collectionId, isActive: true, hasVariants: true },
            create: { id, collectionId, isActive: true, hasVariants: true, tags: ['home', index < 6 ? 'new' : 'popular'] },
        });
        for (const translation of [
            { langId: 'en', name: en, description: `A carefully selected ${en.toLowerCase()} for everyday elegance.` },
            { langId: 'ar', name: ar, description: `قطعة مختارة بعناية تجمع بين الأناقة والجودة.` },
        ]) {
            await prisma.productTranslation.upsert({
                where: { recordId_langId: { recordId: id, langId: translation.langId } },
                update: { name: translation.name, description: translation.description },
                create: { recordId: id, ...translation },
            });
        }
        await prisma.productVariant.updateMany({
            where: { productId: id, sku: { startsWith: `SEED-${id}` } },
            data: { isActive: false },
        });
        for (let variantIndex = 0; variantIndex < variantCounts[index]; variantIndex++) {
            const variantPrice = price + variantIndex * 20;
            const variantStock = Math.max(1, stock - variantIndex * 3);
            const variant = await prisma.productVariant.upsert({
                where: { sku: `SEED-${id}-${variantIndex + 1}` },
                update: {
                    productId: id,
                    price: variantPrice,
                    compareAtPrice: compareAtPrice ? compareAtPrice + variantIndex * 20 : null,
                    stockQuantity: variantStock,
                    isActive: true,
                },
                create: {
                    productId: id,
                    sku: `SEED-${id}-${variantIndex + 1}`,
                    barcode: `91${id}${variantIndex + 1}`,
                    price: variantPrice,
                    compareAtPrice: compareAtPrice ? compareAtPrice + variantIndex * 20 : null,
                    costPrice: Math.max(1, variantPrice * 0.6),
                    stockQuantity: variantStock,
                    isActive: true,
                },
            });
            const combination = variantCombinations[(index * 2 + variantIndex) % variantCombinations.length];
            const attributes = [
                { attributeId: 1201n, valueId: combination[0] },
                { attributeId: 1202n, valueId: combination[1] },
            ];
            for (const attribute of attributes) {
                await prisma.variantAttribute.upsert({
                    where: {
                        productVariantId_attributeId: {
                            productVariantId: variant.id,
                            attributeId: attribute.attributeId,
                        },
                    },
                    update: { productId: id, valueId: attribute.valueId },
                    create: {
                        productId: id,
                        productVariantId: variant.id,
                        attributeId: attribute.attributeId,
                        valueId: attribute.valueId,
                    },
                });
            }
            const variantMediaId = id * 10n + BigInt(variantIndex + 1);
            await upsertMedia(`22000000-0000-4000-8000-${variantMediaId.toString().padStart(12, '0')}`, 'productvariant', variant.id, 'image', variantGalleryImages[(index + variantIndex) % variantGalleryImages.length]);
            await upsertMedia(`23000000-0000-4000-8000-${variantMediaId.toString().padStart(12, '0')}`, 'productvariant', variant.id, 'gallery', variantGalleryImages[(index + variantIndex + 1) % variantGalleryImages.length], false);
            const hasInventoryLog = await prisma.inventoryLog.findFirst({
                where: { variantId: variant.id, reason: 'RESTOCK' },
                select: { id: true },
            });
            if (!hasInventoryLog) {
                await prisma.inventoryLog.create({
                    data: {
                        variantId: variant.id,
                        changeAmount: variantStock,
                        previousStock: 0,
                        newStock: variantStock,
                        reason: 'RESTOCK',
                    },
                });
            }
        }
        await upsertMedia(`20000000-0000-4000-8000-${id.toString().padStart(12, '0')}`, 'product', id, 'image', image);
        await upsertMedia(`21000000-0000-4000-8000-${id.toString().padStart(12, '0')}`, 'product', id, 'gallery', image, false);
    }
    const reviewerPassword = await bcrypt.hash('password123', 10);
    const reviewers = [];
    for (const reviewer of reviewSeeds) {
        reviewers.push(await prisma.user.upsert({
            where: { email: reviewer.email },
            update: {
                name: reviewer.name,
                password: reviewerPassword,
                userType: 'client',
                isEmailVerified: true,
                isActive: true,
            },
            create: {
                name: reviewer.name,
                email: reviewer.email,
                password: reviewerPassword,
                userType: 'client',
                isEmailVerified: true,
                isActive: true,
            },
        }));
    }
    for (const [productIndex] of productSeeds.entries()) {
        const productId = BigInt(2001 + productIndex);
        const reviewCount = 3 + (productIndex % 3);
        for (let reviewIndex = 0; reviewIndex < reviewCount; reviewIndex++) {
            const reviewerIndex = (productIndex + reviewIndex) % reviewers.length;
            const reviewSeed = reviewSeeds[reviewerIndex];
            await prisma.review.upsert({
                where: {
                    userId_productId: {
                        userId: reviewers[reviewerIndex].id,
                        productId,
                    },
                },
                update: {
                    rating: reviewSeed.rating,
                    comment: reviewSeed.comment,
                    isVerified: true,
                    isActive: true,
                },
                create: {
                    userId: reviewers[reviewerIndex].id,
                    productId,
                    rating: reviewSeed.rating,
                    comment: reviewSeed.comment,
                    isVerified: true,
                    isActive: true,
                },
            });
        }
    }
    const sliderSeeds = [
        {
            id: 3001n,
            en: 'Timeless jewellery for every story',
            ar: 'مجوهرات خالدة لكل حكاية',
            image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=85',
        },
        {
            id: 3002n,
            en: 'Discover watches made for your moments',
            ar: 'اكتشف ساعات صممت للحظاتك',
            image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1400&q=85',
        },
    ];
    for (const [index, slider] of sliderSeeds.entries()) {
        await prisma.slider.upsert({
            where: { id: slider.id },
            update: { isActive: true, sortOrder: index + 1 },
            create: { id: slider.id, isActive: true, sortOrder: index + 1 },
        });
        for (const translation of [
            { langId: 'en', title: slider.en },
            { langId: 'ar', title: slider.ar },
        ]) {
            await prisma.sliderTranslation.upsert({
                where: { recordId_langId: { recordId: slider.id, langId: translation.langId } },
                update: { title: translation.title },
                create: { recordId: slider.id, ...translation },
            });
        }
        await upsertMedia(`30000000-0000-4000-8000-${slider.id.toString().padStart(12, '0')}`, 'slider', slider.id, 'slide', slider.image);
    }
}
async function main() {
    console.log('Seeding data...');
    const superAdminRole = await prisma.role.upsert({
        where: { id: BigInt(1) },
        update: {},
        create: {
            id: BigInt(1),
            isActive: true,
            translations: {
                create: [
                    { langId: 'en', name: 'Super Admin' },
                    { langId: 'ar', name: 'مدير العام' },
                ],
            },
        },
    });
    console.log('Super Admin Role created/updated');
    const returnExchangePermissions = ['returns', 'exchanges'].flatMap((resource) => ['list', 'read', 'update'].map((action) => ({ resource, action })));
    for (const permission of returnExchangePermissions) {
        await prisma.permission.upsert({
            where: { resource_action: permission },
            update: { roles: { connect: { id: superAdminRole.id } } },
            create: { ...permission, roles: { connect: { id: superAdminRole.id } } },
        });
    }
    const adminEmail = 'admin@ecommerce.com';
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            roleId: superAdminRole.id,
            userType: 'admin',
            isEmailVerified: true,
            isActive: true,
        },
        create: {
            name: 'Super Admin',
            email: adminEmail,
            password: hashedPassword,
            roleId: superAdminRole.id,
            userType: 'admin',
            isEmailVerified: true,
            isActive: true,
        },
    });
    console.log(`Super Admin User created/updated: ${adminUser.email}`);
    await seedStorefront();
    console.log('Storefront catalog created/updated');
    console.log('Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed.js.map