import type { AppSettingDefault } from './settings.service';

export const DEFAULT_STOREFRONT_SETTINGS: Record<string, AppSettingDefault> = {
  storefront_brand_name: setting('Ecommerce', 'storefront_identity', 'Storefront identity', 'Brand name'),
  storefront_announcement_enabled: setting(true, 'storefront_announcement', 'Announcement bar', 'Show announcement'),
  storefront_announcement_text_en: setting(
    'Free delivery on eligible orders',
    'storefront_announcement',
    'Announcement bar',
    'Announcement text (English)',
  ),
  storefront_announcement_text_ar: setting(
    'توصيل مجاني للطلبات المؤهلة',
    'storefront_announcement',
    'Announcement bar',
    'Announcement text (Arabic)',
  ),
  storefront_announcement_url: setting('/products', 'storefront_announcement', 'Announcement bar', 'Announcement link'),
  storefront_contact_email: setting('support@example.com', 'storefront_contact', 'Contact details', 'Support email'),
  storefront_contact_phone: setting('', 'storefront_contact', 'Contact details', 'Support phone'),
  storefront_address_en: setting('', 'storefront_contact', 'Contact details', 'Address (English)'),
  storefront_address_ar: setting('', 'storefront_contact', 'Contact details', 'Address (Arabic)'),
  storefront_facebook_url: setting('', 'storefront_social', 'Social media', 'Facebook URL'),
  storefront_instagram_url: setting('', 'storefront_social', 'Social media', 'Instagram URL'),
  storefront_x_url: setting('', 'storefront_social', 'Social media', 'X URL'),
  storefront_youtube_url: setting('', 'storefront_social', 'Social media', 'YouTube URL'),
  storefront_tiktok_url: setting('', 'storefront_social', 'Social media', 'TikTok URL'),
  storefront_app_store_url: setting('', 'storefront_apps', 'Mobile apps', 'App Store URL'),
  storefront_google_play_url: setting('', 'storefront_apps', 'Mobile apps', 'Google Play URL'),
  storefront_campaign_enabled: setting(false, 'storefront_campaign', 'Homepage campaign', 'Show campaign card'),
  storefront_campaign_title_en: setting(
    'Big Savings on Your Top Picks!',
    'storefront_campaign',
    'Homepage campaign',
    'Campaign title (English)',
  ),
  storefront_campaign_title_ar: setting(
    'وفّر أكثر على اختياراتك المفضلة!',
    'storefront_campaign',
    'Homepage campaign',
    'Campaign title (Arabic)',
  ),
  storefront_campaign_cta_en: setting('Shop now', 'storefront_campaign', 'Homepage campaign', 'Button label (English)'),
  storefront_campaign_cta_ar: setting('تسوق الآن', 'storefront_campaign', 'Homepage campaign', 'Button label (Arabic)'),
  storefront_campaign_url: setting('/products', 'storefront_campaign', 'Homepage campaign', 'Campaign link'),
  storefront_campaign_expires_at: setting('', 'storefront_campaign', 'Homepage campaign', 'Expiry (ISO date/time)'),
};

export const STOREFRONT_DEFAULT_VALUES = Object.fromEntries(
  Object.entries(DEFAULT_STOREFRONT_SETTINGS).map(([key, setting]) => [key, setting.value]),
);

function setting(
  value: boolean | number | string,
  group: string,
  groupLabel: string,
  keyLabel: string,
): AppSettingDefault {
  return { value, group, groupLabel, type: typeof value === 'boolean' ? 'boolean' : 'string', keyLabel };
}

export type StorefrontConfiguration = ReturnType<typeof toStorefrontConfiguration>;

export function toStorefrontConfiguration(settings: Record<string, unknown>, langId = 'en') {
  const text = (key: string, fallback = '') => {
    const value = settings[key];
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : fallback;
  };
  const enabled = (key: string) => {
    const value = settings[key];
    return value === true || value === 1 || value === '1' || value === 'true';
  };
  const localized = (baseKey: string) => {
    const key = `${baseKey}_${langId === 'ar' ? 'ar' : 'en'}`;
    return text(key, text(`${baseKey}_en`));
  };

  return {
    brandName: text('storefront_brand_name', 'Ecommerce'),
    announcement: {
      enabled: enabled('storefront_announcement_enabled'),
      text: localized('storefront_announcement_text'),
      url: text('storefront_announcement_url'),
    },
    contact: {
      email: text('storefront_contact_email'),
      phone: text('storefront_contact_phone'),
      address: localized('storefront_address'),
    },
    socialLinks: {
      facebook: text('storefront_facebook_url'),
      instagram: text('storefront_instagram_url'),
      x: text('storefront_x_url'),
      youtube: text('storefront_youtube_url'),
      tiktok: text('storefront_tiktok_url'),
    },
    appLinks: {
      appStore: text('storefront_app_store_url'),
      googlePlay: text('storefront_google_play_url'),
    },
    campaign: {
      enabled: enabled('storefront_campaign_enabled'),
      title: localized('storefront_campaign_title'),
      ctaLabel: localized('storefront_campaign_cta'),
      url: text('storefront_campaign_url'),
      expiresAt: text('storefront_campaign_expires_at'),
    },
  };
}
