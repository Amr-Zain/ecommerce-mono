import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DashboardPreferencesService } from './dashboard-preferences.service';
import { createDefaultDashboardPreferences } from './dashboard-preferences.types';

describe('DashboardPreferencesService', () => {
  const users = {
    findSettingsOwner: jest.fn(),
    updateSettings: jest.fn(),
  };
  const i18n = { t: jest.fn((key: string) => key) };
  let service: DashboardPreferencesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DashboardPreferencesService(users as never, i18n as never);
  });

  it('returns the canonical dashboard defaults when preferences are absent', async () => {
    users.findSettingsOwner.mockResolvedValue({
      userType: 'admin',
      settings: { language: 'ar', allow_notifications: true },
    });

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
    users.findSettingsOwner.mockResolvedValue({
      userType: 'admin',
      settings: { language: 'en', allow_notifications: true, market: 'sa' },
    });
    users.updateSettings.mockResolvedValue({});

    await service.update(7n, preferences);

    expect(users.updateSettings).toHaveBeenCalledWith(
      7n,
      expect.objectContaining({
        language: 'en',
        allow_notifications: true,
        market: 'sa',
        dashboard_preferences: expect.objectContaining({ mode: 'light' }),
      }),
    );
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
    users.findSettingsOwner.mockResolvedValue({ userType: 'admin', settings: {} });
    users.updateSettings.mockResolvedValue({});
    const first = createDefaultDashboardPreferences('en');
    const second = createDefaultDashboardPreferences('ar');

    await service.update(11n, first);
    await service.update(22n, second);

    expect(users.updateSettings.mock.calls[0][0]).toBe(11n);
    expect(users.updateSettings.mock.calls[1][0]).toBe(22n);
  });

  it('rejects non-admin accounts', async () => {
    users.findSettingsOwner.mockResolvedValue({ userType: 'client', settings: {} });

    await expect(service.get(1n)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
