import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DashboardPreferencesService } from './dashboard-preferences.service';
import { createDefaultDashboardPreferences } from './dashboard-preferences.types';

describe('DashboardPreferencesService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const i18n = { t: jest.fn((key: string) => key) };
  let service: DashboardPreferencesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DashboardPreferencesService(prisma as never, i18n as never);
  });

  it('returns the canonical dashboard defaults when preferences are absent', async () => {
    prisma.user.findUnique.mockResolvedValue({ userType: 'admin', settings: { language: 'ar', allow_notifications: true } });

    const result = await service.get(1n);

    expect(result).toEqual(createDefaultDashboardPreferences('ar'));
    expect(result).toEqual({
      version: 1,
      mode: 'dark',
      theme: {
        source: 'tweakcn',
        presetId: 'violet-bloom',
        customVariables: { light: {}, dark: {} },
        overrides: { light: {}, dark: {} },
      },
      radius: '1rem',
      fonts: { latin: 'poppins', arabic: 'cairo' },
      sidebar: { variant: 'inset', collapsible: 'icon', side: 'left' },
    });
  });

  it('merges preferences without replacing sibling user settings', async () => {
    const preferences = createDefaultDashboardPreferences('en');
    preferences.mode = 'light';
    prisma.user.findUnique.mockResolvedValue({
      userType: 'admin',
      settings: { language: 'en', allow_notifications: true, market: 'sa' },
    });
    prisma.user.update.mockResolvedValue({});

    await service.update(7n, preferences);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 7n },
      data: {
        settings: expect.objectContaining({
          language: 'en',
          allow_notifications: true,
          market: 'sa',
          dashboard_preferences: expect.objectContaining({ mode: 'light' }),
        }),
      },
    });
  });

  it('rejects unsupported and unsafe theme variables', async () => {
    const unsupported = createDefaultDashboardPreferences('en');
    unsupported.theme.overrides.light['not-allowed'] = '#fff';
    await expect(service.update(1n, unsupported)).rejects.toBeInstanceOf(BadRequestException);

    const unsafe = createDefaultDashboardPreferences('en');
    unsafe.theme.overrides.dark.primary = 'url(https://example.com/a)';
    await expect(service.update(1n, unsafe)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an out-of-range radius', async () => {
    const preferences = createDefaultDashboardPreferences('en');
    preferences.radius = '3rem';

    await expect(service.update(1n, preferences)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('keeps preferences isolated by the authenticated user id', async () => {
    prisma.user.findUnique.mockResolvedValue({ userType: 'admin', settings: {} });
    prisma.user.update.mockResolvedValue({});
    const first = createDefaultDashboardPreferences('en');
    const second = createDefaultDashboardPreferences('ar');

    await service.update(11n, first);
    await service.update(22n, second);

    expect(prisma.user.update.mock.calls[0][0].where.id).toBe(11n);
    expect(prisma.user.update.mock.calls[1][0].where.id).toBe(22n);
  });

  it('rejects non-admin accounts', async () => {
    prisma.user.findUnique.mockResolvedValue({ userType: 'client', settings: {} });

    await expect(service.get(1n)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
