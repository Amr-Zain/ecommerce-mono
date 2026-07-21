import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
] as const;

const variantCounts = [3, 7, 4, 6, 2, 8, 5, 3, 9, 1, 6, 4] as const;
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
] as const;
const variantGalleryImages = [
  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=85',
] as const;

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
] as const;

const countrySeeds = [
  {
    id: 4001n,
    phoneCode: '966',
    phoneLength: 9,
    phoneStartWith: 5,
    shippingPrice: 25,
    en: { name: 'Saudi Arabia', nationality: 'Saudi', shortName: 'SA', currencyCode: 'SAR' },
    ar: { name: 'المملكة العربية السعودية', nationality: 'سعودي', shortName: 'SA', currencyCode: 'SAR' },
  },
  {
    id: 4002n,
    phoneCode: '971',
    phoneLength: 9,
    phoneStartWith: 5,
    shippingPrice: 30,
    en: { name: 'United Arab Emirates', nationality: 'Emirati', shortName: 'AE', currencyCode: 'AED' },
    ar: { name: 'الإمارات العربية المتحدة', nationality: 'إماراتي', shortName: 'AE', currencyCode: 'AED' },
  },
  {
    id: 4003n,
    phoneCode: '20',
    phoneLength: 10,
    phoneStartWith: 1,
    shippingPrice: 18,
    en: { name: 'Egypt', nationality: 'Egyptian', shortName: 'EG', currencyCode: 'EGP' },
    ar: { name: 'مصر', nationality: 'مصري', shortName: 'EG', currencyCode: 'EGP' },
  },
] as const;

const citySeeds = [
  { id: 4101n, countryId: 4001n, en: 'Riyadh', ar: 'الرياض' },
  { id: 4102n, countryId: 4001n, en: 'Jeddah', ar: 'جدة' },
  { id: 4103n, countryId: 4001n, en: 'Dammam', ar: 'الدمام' },
  { id: 4104n, countryId: 4001n, en: 'Makkah', ar: 'مكة' },
  { id: 4105n, countryId: 4001n, en: 'Madinah', ar: 'المدينة' },
  { id: 4201n, countryId: 4002n, en: 'Dubai', ar: 'دبي' },
  { id: 4202n, countryId: 4002n, en: 'Abu Dhabi', ar: 'أبو ظبي' },
  { id: 4203n, countryId: 4002n, en: 'Sharjah', ar: 'الشارقة' },
  { id: 4301n, countryId: 4003n, en: 'Cairo', ar: 'القاهرة' },
  { id: 4302n, countryId: 4003n, en: 'Alexandria', ar: 'الإسكندرية' },
  { id: 4303n, countryId: 4003n, en: 'Giza', ar: 'الجيزة' },
] as const;

const staticPageSeeds = [
  {
    id: 5001n,
    slug: 'returns',
    en: {
      title: 'Returns & Exchanges',
      content:
        'We want every order to feel right. Eligible pieces can be returned or exchanged after delivery when they are unused, complete, and in their original packaging.',
    },
    ar: {
      title: 'الإرجاع والاستبدال',
      content:
        'نريد أن تكون كل تجربة شراء مناسبة لك. يمكن إرجاع أو استبدال القطع المؤهلة بعد الاستلام إذا كانت غير مستخدمة وبحالتها الأصلية وكاملة التغليف.',
    },
    sections: [
      {
        en: { title: 'Return window', content: 'Start a return request within 14 days of receiving your order.' },
        ar: { title: 'مدة الإرجاع', content: 'يمكنك بدء طلب الإرجاع خلال 14 يوما من استلام الطلب.' },
      },
      {
        en: { title: 'Item condition', content: 'Items must be unworn, undamaged, and returned with tags, certificates, and packaging.' },
        ar: { title: 'حالة المنتج', content: 'يجب أن تكون المنتجات غير مستخدمة وغير تالفة ومعها البطاقات والشهادات والتغليف.' },
      },
      {
        en: { title: 'Refund timing', content: 'Approved refunds are processed to the original payment method within 5 to 7 business days.' },
        ar: { title: 'وقت الاسترداد', content: 'تتم معالجة المبالغ المستردة المقبولة إلى وسيلة الدفع الأصلية خلال 5 إلى 7 أيام عمل.' },
      },
    ],
  },
  {
    id: 5002n,
    slug: 'payment',
    en: {
      title: 'Payment',
      content:
        'Shop securely with supported online payment methods, bank transfer, or cash on delivery where available.',
    },
    ar: {
      title: 'الدفع',
      content: 'تسوق بأمان باستخدام وسائل الدفع الإلكتروني المدعومة أو التحويل البنكي أو الدفع عند الاستلام عند توفره.',
    },
    sections: [
      {
        en: { title: 'Secure checkout', content: 'Card payments are handled through encrypted payment providers and are never stored on our storefront.' },
        ar: { title: 'دفع آمن', content: 'تتم معالجة مدفوعات البطاقات عبر مزودي دفع مشفرين ولا يتم تخزينها في المتجر.' },
      },
      {
        en: { title: 'Order confirmation', content: 'You will receive an order confirmation once payment is authorized or your transfer is reviewed.' },
        ar: { title: 'تأكيد الطلب', content: 'سيصلك تأكيد الطلب بعد اعتماد الدفع أو مراجعة التحويل.' },
      },
    ],
  },
  {
    id: 5003n,
    slug: 'warranty',
    en: {
      title: 'Warranty',
      content:
        'Our jewellery and watches are covered against manufacturing defects according to the product category and care instructions.',
    },
    ar: {
      title: 'الضمان',
      content: 'تخضع مجوهراتنا وساعاتنا لضمان ضد عيوب الصناعة حسب فئة المنتج وتعليمات العناية.',
    },
    sections: [
      {
        en: { title: 'Coverage', content: 'Warranty covers manufacturing faults in clasps, settings, mechanisms, and materials under normal use.' },
        ar: { title: 'التغطية', content: 'يشمل الضمان عيوب الصناعة في الأقفال والترصيع والآليات والمواد عند الاستخدام الطبيعي.' },
      },
      {
        en: { title: 'Exclusions', content: 'Damage from accidents, misuse, chemicals, unauthorized repair, or normal wear is not covered.' },
        ar: { title: 'الاستثناءات', content: 'لا يشمل الضمان التلف الناتج عن الحوادث أو سوء الاستخدام أو المواد الكيميائية أو الإصلاح غير المعتمد أو الاستهلاك الطبيعي.' },
      },
      {
        en: { title: 'How to claim', content: 'Contact support with your order number, photos, and a short description of the issue.' },
        ar: { title: 'طريقة المطالبة', content: 'تواصل مع الدعم مع رقم الطلب والصور ووصف مختصر للمشكلة.' },
      },
    ],
  },
  {
    id: 5004n,
    slug: 'privacy-policy',
    en: {
      title: 'Privacy Policy',
      content:
        'This policy explains how we collect, use, and protect the information you share while shopping with us.',
    },
    ar: {
      title: 'سياسة الخصوصية',
      content: 'توضح هذه السياسة كيف نجمع المعلومات التي تشاركها أثناء التسوق ونستخدمها ونحميها.',
    },
    sections: [
      {
        en: { title: 'Information we collect', content: 'We collect account, contact, order, payment-status, and support details needed to serve you.' },
        ar: { title: 'المعلومات التي نجمعها', content: 'نجمع بيانات الحساب والتواصل والطلبات وحالة الدفع والدعم اللازمة لخدمتك.' },
      },
      {
        en: { title: 'How we use data', content: 'We use data to process orders, personalize service, prevent fraud, and communicate important updates.' },
        ar: { title: 'كيف نستخدم البيانات', content: 'نستخدم البيانات لمعالجة الطلبات وتخصيص الخدمة ومنع الاحتيال وإرسال التحديثات المهمة.' },
      },
      {
        en: { title: 'Your choices', content: 'You may update your profile, notification preferences, or contact us about privacy requests.' },
        ar: { title: 'اختياراتك', content: 'يمكنك تحديث ملفك الشخصي وتفضيلات الإشعارات أو التواصل معنا بخصوص طلبات الخصوصية.' },
      },
    ],
  },
  {
    id: 5005n,
    slug: 'purchase-protection',
    en: {
      title: 'Purchase Protection',
      content:
        'Every eligible order is protected from checkout to delivery with careful packing, tracking, and support assistance.',
    },
    ar: {
      title: 'حماية المشتريات',
      content: 'كل طلب مؤهل محمي من الدفع حتى التسليم من خلال تغليف دقيق وتتبع ومساعدة من فريق الدعم.',
    },
    sections: [
      {
        en: { title: 'Before shipping', content: 'Orders are inspected and packed to protect delicate finishes, stones, and watch components.' },
        ar: { title: 'قبل الشحن', content: 'تتم مراجعة الطلبات وتغليفها لحماية التشطيبات والأحجار ومكونات الساعات.' },
      },
      {
        en: { title: 'During delivery', content: 'Trackable shipping helps monitor your order until it reaches the selected address.' },
        ar: { title: 'أثناء التسليم', content: 'يساعد الشحن القابل للتتبع على متابعة الطلب حتى وصوله إلى العنوان المحدد.' },
      },
    ],
  },
  {
    id: 5006n,
    slug: 'terms-of-use',
    en: {
      title: 'Terms of Use',
      content:
        'These terms describe the rules for using our storefront, placing orders, and interacting with our services.',
    },
    ar: {
      title: 'شروط الاستخدام',
      content: 'توضح هذه الشروط قواعد استخدام المتجر وإجراء الطلبات والتعامل مع خدماتنا.',
    },
    sections: [
      {
        en: { title: 'Using the storefront', content: 'Use the website lawfully and provide accurate details when creating an account or placing orders.' },
        ar: { title: 'استخدام المتجر', content: 'استخدم الموقع بشكل نظامي وقدم بيانات دقيقة عند إنشاء الحساب أو إجراء الطلبات.' },
      },
      {
        en: { title: 'Product information', content: 'We work to keep product details accurate, but availability and prices may change before checkout.' },
        ar: { title: 'معلومات المنتجات', content: 'نسعى للحفاظ على دقة تفاصيل المنتجات، لكن التوفر والأسعار قد تتغير قبل إتمام الدفع.' },
      },
    ],
  },
  {
    id: 5007n,
    slug: 'cookies-policy',
    en: {
      title: 'Cookies Policy',
      content:
        'Cookies help us remember preferences, keep sessions secure, and understand how visitors use the storefront.',
    },
    ar: {
      title: 'سياسة ملفات تعريف الارتباط',
      content: 'تساعدنا ملفات تعريف الارتباط على حفظ التفضيلات وتأمين الجلسات وفهم استخدام الزوار للمتجر.',
    },
    sections: [
      {
        en: { title: 'Essential cookies', content: 'Some cookies are needed for login, cart, checkout, language, and security features.' },
        ar: { title: 'الملفات الأساسية', content: 'بعض الملفات ضرورية لتسجيل الدخول والسلة والدفع واللغة وميزات الأمان.' },
      },
      {
        en: { title: 'Preference cookies', content: 'Preference cookies remember settings such as language, theme, and shopping region.' },
        ar: { title: 'ملفات التفضيلات', content: 'تحفظ ملفات التفضيلات إعدادات مثل اللغة والمظهر ومنطقة التسوق.' },
      },
    ],
  },
  {
    id: 5008n,
    slug: 'size-guide',
    en: {
      title: 'Size Guide',
      content:
        'Use this guide to choose comfortable ring, bracelet, necklace, and watch sizes before ordering.',
    },
    ar: {
      title: 'دليل المقاسات',
      content: 'استخدم هذا الدليل لاختيار مقاسات الخواتم والأساور والقلائد والساعات بشكل مريح قبل الطلب.',
    },
    sections: [
      {
        en: { title: 'Rings', content: 'Measure an existing ring inner diameter or wrap a strip around your finger and compare it to a size chart.' },
        ar: { title: 'الخواتم', content: 'قس القطر الداخلي لخاتم مناسب أو لف شريطا حول الإصبع وقارنه بجدول المقاسات.' },
      },
      {
        en: { title: 'Bracelets and watches', content: 'Measure around the wrist and add a little room based on how loose you prefer the fit.' },
        ar: { title: 'الأساور والساعات', content: 'قس محيط المعصم وأضف مساحة بسيطة حسب درجة الاتساع المفضلة لديك.' },
      },
    ],
  },
] as const;

const showroomSeeds = [
  {
    id: 6001n,
    countryId: 4001n,
    phoneCode: '966',
    phone: '512345678',
    email: 'riyadh.showroom@example.com',
    url: 'https://www.google.com/maps?q=24.7136,46.6753',
    lat: 24.7136,
    lng: 46.6753,
    en: {
      name: 'Riyadh Olaya Showroom',
      address: 'King Fahd Road, Olaya District',
      city: 'Riyadh',
    },
    ar: {
      name: 'معرض الرياض العليا',
      address: 'طريق الملك فهد، حي العليا',
      city: 'الرياض',
    },
  },
  {
    id: 6002n,
    countryId: 4002n,
    phoneCode: '971',
    phone: '501234567',
    email: 'dubai.showroom@example.com',
    url: 'https://www.google.com/maps?q=25.2048,55.2708',
    lat: 25.2048,
    lng: 55.2708,
    en: {
      name: 'Dubai City Walk Showroom',
      address: 'City Walk, Al Wasl',
      city: 'Dubai',
    },
    ar: {
      name: 'معرض دبي سيتي ووك',
      address: 'سيتي ووك، الوصل',
      city: 'دبي',
    },
  },
  {
    id: 6003n,
    countryId: 4003n,
    phoneCode: '20',
    phone: '1001234567',
    email: 'cairo.showroom@example.com',
    url: 'https://www.google.com/maps?q=30.0444,31.2357',
    lat: 30.0444,
    lng: 31.2357,
    en: {
      name: 'Cairo Zamalek Showroom',
      address: '26th of July Corridor, Zamalek',
      city: 'Cairo',
    },
    ar: {
      name: 'معرض القاهرة الزمالك',
      address: 'محور 26 يوليو، الزمالك',
      city: 'القاهرة',
    },
  },
] as const;

async function upsertMedia(
  prisma: PrismaClient,
  uuid: string,
  model: string,
  modelId: bigint,
  collection: string,
  path: string,
  isMain = true,
) {
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

export async function seedStorefront(prisma: PrismaClient) {
  for (const country of countrySeeds) {
    await prisma.country.upsert({
      where: { id: country.id },
      update: {
        phoneCode: country.phoneCode,
        phoneLength: country.phoneLength,
        phoneStartWith: country.phoneStartWith,
        shippingPrice: country.shippingPrice,
        isActive: true,
      },
      create: {
        id: country.id,
        phoneCode: country.phoneCode,
        phoneLength: country.phoneLength,
        phoneStartWith: country.phoneStartWith,
        shippingPrice: country.shippingPrice,
        isActive: true,
      },
    });
    for (const translation of [
      { langId: 'en', ...country.en },
      { langId: 'ar', ...country.ar },
    ]) {
      await prisma.countryTranslation.upsert({
        where: { recordId_langId: { recordId: country.id, langId: translation.langId } },
        update: {
          name: translation.name,
          nationality: translation.nationality,
          shortName: translation.shortName,
          currencyCode: translation.currencyCode,
        },
        create: { recordId: country.id, ...translation },
      });
    }
  }

  for (const city of citySeeds) {
    await prisma.city.upsert({
      where: { id: city.id },
      update: {
        countryId: city.countryId,
        isActive: true,
      },
      create: {
        id: city.id,
        countryId: city.countryId,
        isActive: true,
      },
    });
    for (const translation of [
      { langId: 'en', name: city.en },
      { langId: 'ar', name: city.ar },
    ]) {
      await prisma.cityTranslation.upsert({
        where: { recordId_langId: { recordId: city.id, langId: translation.langId } },
        update: { name: translation.name },
        create: { recordId: city.id, ...translation },
      });
    }
  }

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
    await upsertMedia(
      prisma,
      `10000000-0000-4000-8000-${collection.id.toString().padStart(12, '0')}`,
      'collection',
      collection.id,
      'collection',
      collection.image,
    );
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
      data: { isActive: false, isDefault: false },
    });
    for (let variantIndex = 0; variantIndex < variantCounts[index]; variantIndex++) {
      const variantPrice = price + variantIndex * 20;
      const variantStock = Math.max(1, stock - variantIndex * 3);
      const isDefault = variantIndex === 0;
      const variant = await prisma.productVariant.upsert({
        where: { sku: `SEED-${id}-${variantIndex + 1}` },
        update: {
          productId: id,
          price: variantPrice,
          compareAtPrice: compareAtPrice ? compareAtPrice + variantIndex * 20 : null,
          stockQuantity: variantStock,
          isDefault,
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
          isDefault,
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
      await upsertMedia(
        prisma,
        `22000000-0000-4000-8000-${variantMediaId.toString().padStart(12, '0')}`,
        'productvariant',
        variant.id,
        'image',
        variantGalleryImages[(index + variantIndex) % variantGalleryImages.length],
      );
      await upsertMedia(
        prisma,
        `23000000-0000-4000-8000-${variantMediaId.toString().padStart(12, '0')}`,
        'productvariant',
        variant.id,
        'gallery',
        variantGalleryImages[(index + variantIndex + 1) % variantGalleryImages.length],
        false,
      );
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
    await upsertMedia(
      prisma,
      `20000000-0000-4000-8000-${id.toString().padStart(12, '0')}`,
      'product',
      id,
      'image',
      image,
    );
    await upsertMedia(
      prisma,
      `21000000-0000-4000-8000-${id.toString().padStart(12, '0')}`,
      'product',
      id,
      'gallery',
      image,
      false,
    );
  }

  const reviewerPassword = await bcrypt.hash('password123', 10);
  const reviewers = [];
  for (const reviewer of reviewSeeds) {
    reviewers.push(
      await prisma.user.upsert({
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
      }),
    );
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
    await upsertMedia(
      prisma,
      `30000000-0000-4000-8000-${slider.id.toString().padStart(12, '0')}`,
      'slider',
      slider.id,
      'slide',
      slider.image,
    );
  }

  for (const page of staticPageSeeds) {
    await prisma.staticPage.upsert({
      where: { id: page.id },
      update: { slug: page.slug, isActive: true },
      create: { id: page.id, slug: page.slug, isActive: true },
    });
    for (const translation of [
      { langId: 'en', ...page.en },
      { langId: 'ar', ...page.ar },
    ]) {
      await prisma.staticPageTranslation.upsert({
        where: { recordId_langId: { recordId: page.id, langId: translation.langId } },
        update: { title: translation.title, content: translation.content },
        create: { recordId: page.id, ...translation },
      });
    }
    for (const [sectionIndex, section] of page.sections.entries()) {
      const sectionId = page.id * 10n + BigInt(sectionIndex + 1);
      await prisma.pageSection.upsert({
        where: { id: sectionId },
        update: {
          staticPageId: page.id,
          sortOrder: sectionIndex + 1,
          isActive: true,
        },
        create: {
          id: sectionId,
          staticPageId: page.id,
          sortOrder: sectionIndex + 1,
          isActive: true,
        },
      });
      for (const translation of [
        { langId: 'en', ...section.en },
        { langId: 'ar', ...section.ar },
      ]) {
        await prisma.pageSectionTranslation.upsert({
          where: { recordId_langId: { recordId: sectionId, langId: translation.langId } },
          update: { title: translation.title, content: translation.content },
          create: { recordId: sectionId, ...translation },
        });
      }
    }
  }

  for (const showroom of showroomSeeds) {
    await prisma.showRoom.upsert({
      where: { id: showroom.id },
      update: {
        countryId: showroom.countryId,
        phoneCode: showroom.phoneCode,
        phone: showroom.phone,
        email: showroom.email,
        url: showroom.url,
        lat: showroom.lat,
        lng: showroom.lng,
        isActive: true,
      },
      create: {
        id: showroom.id,
        countryId: showroom.countryId,
        phoneCode: showroom.phoneCode,
        phone: showroom.phone,
        email: showroom.email,
        url: showroom.url,
        lat: showroom.lat,
        lng: showroom.lng,
        isActive: true,
      },
    });
    for (const translation of [
      { langId: 'en', ...showroom.en },
      { langId: 'ar', ...showroom.ar },
    ]) {
      await prisma.showRoomTranslation.upsert({
        where: { recordId_langId: { recordId: showroom.id, langId: translation.langId } },
        update: {
          name: translation.name,
          address: translation.address,
          city: translation.city,
        },
        create: { recordId: showroom.id, ...translation },
      });
    }
  }

  console.log('Storefront catalog created/updated');
}
