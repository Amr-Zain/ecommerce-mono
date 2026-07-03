import { PrismaClient } from '../../node_modules/.prisma/client/index.js';

function buildEmailHtml(
  direction: 'ltr' | 'rtl',
  locale: 'en' | 'ar',
  heading: string,
  body: string,
  highlight?: string,
) {
  const ignoreText =
    locale === 'ar'
      ? 'إذا لم تطلب هذا البريد، يمكنك تجاهله بأمان.'
      : 'If you did not request this email, you can safely ignore it.';
  const footerTagline =
    locale === 'ar' ? 'مجوهرات وساعات فاخرة لكل مناسبة.' : 'Fine jewellery and watches for every occasion.';

  return `<!doctype html>
<html dir="${direction}" lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:Arial,Helvetica,sans-serif;color:#171717;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#171717;padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;letter-spacing:3px;font-weight:600;">Ecommerce App</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 20px;font-size:24px;color:#171717;font-weight:600;">${heading}</h2>
              <p style="margin:0 0 24px;line-height:1.7;color:#525252;font-size:16px;">${body}</p>
              ${highlight ? `<div style="background:#f5f5f5;border-radius:12px;padding:24px;text-align:center;margin:24px 0;border:1px solid #e5e5e5;">${highlight}</div>` : ''}
              <p style="margin:32px 0 0;line-height:1.6;color:#737373;font-size:14px;">${ignoreText}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f5f5;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 8px;color:#171717;font-size:14px;font-weight:600;">Ecommerce App</p>
              <p style="margin:0;color:#737373;font-size:13px;">${footerTagline}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const otpHighlight = (label: string, expiresLabel: string) =>
  `<p style="margin:0 0 8px;font-size:14px;color:#737373;">${label}</p><p style="margin:0;font-size:36px;font-weight:700;letter-spacing:12px;color:#171717;">{{code}}</p><p style="margin:12px 0 0;font-size:14px;color:#737373;">${expiresLabel}</p>`;

const emailTemplates = [
  {
    id: 4001n,
    key: 'email_otp',
    name: 'Email Verification OTP',
    channel: 'email',
    purpose: 'otp',
    content: {
      en: {
        subject: 'Your verification code',
        body: 'Use the verification code below to complete your request. This code is valid for {{expiresMinutes}} minutes.',
        html: buildEmailHtml(
          'ltr',
          'en',
          'Verify your email',
          'Use the verification code below to complete your request. This code is valid for {{expiresMinutes}} minutes.',
          otpHighlight('Verification code', 'Expires in {{expiresMinutes}} minutes'),
        ),
      },
      ar: {
        subject: 'رمز التحقق الخاص بك',
        body: 'استخدم رمز التحقق أدناه لإكمال طلبك. الرمز صالح لمدة {{expiresMinutes}} دقيقة.',
        html: buildEmailHtml(
          'rtl',
          'ar',
          'تأكيد بريدك الإلكتروني',
          'استخدم رمز التحقق أدناه لإكمال طلبك. الرمز صالح لمدة {{expiresMinutes}} دقيقة.',
          otpHighlight('رمز التحقق', 'صالح لمدة {{expiresMinutes}} دقيقة'),
        ),
      },
    },
    variables: { code: 'string', expiresMinutes: 'number' },
  },
  {
    id: 4002n,
    key: 'password_reset_otp',
    name: 'Password Reset OTP',
    channel: 'email',
    purpose: 'otp',
    content: {
      en: {
        subject: 'Reset your password',
        body: 'We received a request to reset your password. Use the code below to continue. It is valid for {{expiresMinutes}} minutes.',
        html: buildEmailHtml(
          'ltr',
          'en',
          'Reset your password',
          'We received a request to reset your password. Use the code below to continue. It is valid for {{expiresMinutes}} minutes.',
          otpHighlight('Password reset code', 'Expires in {{expiresMinutes}} minutes'),
        ),
      },
      ar: {
        subject: 'إعادة تعيين كلمة المرور',
        body: 'تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. استخدم الرمز أدناه للمتابعة. صالح لمدة {{expiresMinutes}} دقيقة.',
        html: buildEmailHtml(
          'rtl',
          'ar',
          'إعادة تعيين كلمة المرور',
          'تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. استخدم الرمز أدناه للمتابعة. صالح لمدة {{expiresMinutes}} دقيقة.',
          otpHighlight('رمز إعادة التعيين', 'صالح لمدة {{expiresMinutes}} دقيقة'),
        ),
      },
    },
    variables: { code: 'string', expiresMinutes: 'number' },
  },
  {
    id: 4003n,
    key: 'welcome',
    name: 'Welcome Email',
    channel: 'email',
    purpose: 'welcome',
    content: {
      en: {
        subject: 'Welcome to Ecommerce App',
        body: 'Your email has been verified successfully. We are excited to have you discover our collection of fine jewellery and watches.',
        html: buildEmailHtml(
          'ltr',
          'en',
          'Welcome{{name}}!',
          'Your email has been verified successfully. We are excited to have you discover our collection of fine jewellery and watches.',
        ),
      },
      ar: {
        subject: 'مرحباً بك في Ecommerce App',
        body: 'تم تأكيد بريدك الإلكتروني بنجاح. نتطلع لأن تكتشف مجموعتنا من المجوهرات والساعات الفاخرة.',
        html: buildEmailHtml(
          'rtl',
          'ar',
          'مرحباً {{name}}!',
          'تم تأكيد بريدك الإلكتروني بنجاح. نتطلع لأن تكتشف مجموعتنا من المجوهرات والساعات الفاخرة.',
        ),
      },
    },
    variables: { name: 'string' },
  },
  {
    id: 4004n,
    key: 'campaign_promotion',
    name: 'Campaign Promotion',
    channel: 'both',
    purpose: 'campaign',
    content: {
      en: {
        subject: '{{campaignTitle}}',
        title: '{{campaignTitle}}',
        body: 'Hi {{name}}, {{message}} Use code {{couponCode}} before {{expiresAt}}.',
        html: buildEmailHtml(
          'ltr',
          'en',
          '{{campaignTitle}}',
          'Hi {{name}}, {{message}} Use code {{couponCode}} before {{expiresAt}}.',
        ),
      },
      ar: {
        subject: '{{campaignTitle}}',
        title: '{{campaignTitle}}',
        body: 'Hello {{name}}, {{message}} Use code {{couponCode}} before {{expiresAt}}.',
        html: buildEmailHtml(
          'rtl',
          'ar',
          '{{campaignTitle}}',
          'Hello {{name}}, {{message}} Use code {{couponCode}} before {{expiresAt}}.',
        ),
      },
    },
    variables: {
      campaignTitle: 'string',
      name: 'string',
      message: 'string',
      couponCode: 'string',
      expiresAt: 'string',
    },
  },
  {
    id: 4005n,
    key: 'order_status_update',
    name: 'Order Status Update',
    channel: 'both',
    purpose: 'generic',
    content: {
      en: {
        subject: 'Order {{orderNumber}} is {{status}}',
        title: 'Order {{orderNumber}} update',
        body: 'Your order {{orderNumber}} is now {{status}}. {{message}}',
        html: buildEmailHtml(
          'ltr',
          'en',
          'Order {{orderNumber}} update',
          'Your order {{orderNumber}} is now {{status}}. {{message}}',
        ),
      },
      ar: {
        subject: 'Order {{orderNumber}} is {{status}}',
        title: 'Order {{orderNumber}} update',
        body: 'Your order {{orderNumber}} is now {{status}}. {{message}}',
        html: buildEmailHtml(
          'rtl',
          'ar',
          'Order {{orderNumber}} update',
          'Your order {{orderNumber}} is now {{status}}. {{message}}',
        ),
      },
    },
    variables: { orderNumber: 'string', status: 'string', message: 'string' },
  },
  {
    id: 4006n,
    key: 'loyalty_points_added',
    name: 'Loyalty Points Added',
    channel: 'notification',
    purpose: 'generic',
    content: {
      en: {
        title: 'You earned {{points}} points',
        body: '{{points}} loyalty points were added to your account from {{source}}.',
      },
      ar: {
        title: 'You earned {{points}} points',
        body: '{{points}} loyalty points were added to your account from {{source}}.',
      },
    },
    variables: { points: 'number', source: 'string' },
  },
  {
    id: 4007n,
    key: 'tier_upgraded',
    name: 'Tier Upgrade Congratulations',
    channel: 'both',
    purpose: 'generic',
    content: {
      en: {
        subject: 'Congratulations, you reached {{tierName}}',
        title: 'You are now {{tierName}}',
        body: 'Congratulations {{name}}! Your loyalty tier is now {{tierName}} with a {{multiplier}}x earning multiplier.',
        html: buildEmailHtml(
          'ltr',
          'en',
          'You are now {{tierName}}',
          'Congratulations {{name}}! Your loyalty tier is now {{tierName}} with a {{multiplier}}x earning multiplier.',
        ),
      },
      ar: {
        subject: 'Congratulations, you reached {{tierName}}',
        title: 'You are now {{tierName}}',
        body: 'Congratulations {{name}}! Your loyalty tier is now {{tierName}} with a {{multiplier}}x earning multiplier.',
        html: buildEmailHtml(
          'rtl',
          'ar',
          'You are now {{tierName}}',
          'Congratulations {{name}}! Your loyalty tier is now {{tierName}} with a {{multiplier}}x earning multiplier.',
        ),
      },
    },
    variables: { name: 'string', tierName: 'string', multiplier: 'number' },
  },
  {
    id: 4008n,
    key: 'support_reply',
    name: 'Support Ticket Reply',
    channel: 'notification',
    purpose: 'generic',
    content: {
      en: {
        title: 'New reply on ticket {{ticketNumber}}',
        body: '{{agentName}} replied to your support ticket: {{summary}}',
      },
      ar: {
        title: 'New reply on ticket {{ticketNumber}}',
        body: '{{agentName}} replied to your support ticket: {{summary}}',
      },
    },
    variables: { ticketNumber: 'string', agentName: 'string', summary: 'string' },
  },
  {
    id: 4009n,
    key: 'back_in_stock',
    name: 'Back In Stock',
    channel: 'email',
    purpose: 'campaign',
    content: {
      en: {
        subject: '{{productName}} is back in stock',
        body: 'Good news {{name}}, {{productName}} is available again. View it here: {{productUrl}}',
        html: buildEmailHtml(
          'ltr',
          'en',
          '{{productName}} is back in stock',
          'Good news {{name}}, {{productName}} is available again. View it here: {{productUrl}}',
        ),
      },
      ar: {
        subject: '{{productName}} is back in stock',
        body: 'Good news {{name}}, {{productName}} is available again. View it here: {{productUrl}}',
        html: buildEmailHtml(
          'rtl',
          'ar',
          '{{productName}} is back in stock',
          'Good news {{name}}, {{productName}} is available again. View it here: {{productUrl}}',
        ),
      },
    },
    variables: { name: 'string', productName: 'string', productUrl: 'string' },
  },
  {
    id: 4010n,
    key: 'manual_announcement',
    name: 'Manual Announcement',
    channel: 'both',
    purpose: 'campaign',
    content: {
      en: {
        subject: '{{title}}',
        title: '{{title}}',
        body: '{{body}}',
        html: buildEmailHtml('ltr', 'en', '{{title}}', '{{body}}'),
      },
      ar: {
        subject: '{{title}}',
        title: '{{title}}',
        body: '{{body}}',
        html: buildEmailHtml('rtl', 'ar', '{{title}}', '{{body}}'),
      },
    },
    variables: { title: 'string', body: 'string' },
  },
];

export async function seedEmailTemplates(prisma: PrismaClient) {
  for (const template of emailTemplates) {
    await prisma.messageTemplate.upsert({
      where: { id: template.id },
      update: {
        key: template.key,
        name: template.name,
        channel: template.channel,
        purpose: template.purpose,
        content: template.content,
        variables: template.variables,
        isActive: true,
      },
      create: {
        id: template.id,
        key: template.key,
        name: template.name,
        channel: template.channel,
        purpose: template.purpose,
        content: template.content,
        variables: template.variables,
        isActive: true,
      },
    });
  }

  console.log('Email templates created/updated');
}
