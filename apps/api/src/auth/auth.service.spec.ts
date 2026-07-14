import { NotFoundException, UnauthorizedException } from '@nestjs/common';

import { AuthService, type AuthUserPayload } from './auth.service';

describe('AuthService session lifecycle', () => {
  const jwt = {
    decode: jest.fn(),
    sign: jest.fn(),
  };
  const config = {
    get: jest.fn((key: string, fallback?: string) => {
      const values: Record<string, string> = {
        JWT_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
        JWT_ACCESS_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
      };
      return values[key] ?? fallback;
    }),
  };
  const users = { findOne: jest.fn(), update: jest.fn() };
  const refreshTokens = {
    consumeActiveToken: jest.fn(),
    create: jest.fn(),
    revokeByToken: jest.fn(),
    revokeSession: jest.fn(),
    getUserSessions: jest.fn(),
    revokeAllUserTokens: jest.fn(),
  };
  const i18n = { t: jest.fn((key: string) => key) };
  const anonymousSessions = { claim: jest.fn() };
  const emailChallenges = {};
  const eventEmitter = {};
  const domainEvents = {};
  const loyalty = {};

  const service = new AuthService(
    jwt as never,
    config as never,
    users as never,
    refreshTokens as never,
    i18n as never,
    anonymousSessions as never,
    emailChallenges as never,
    eventEmitter as never,
    domainEvents as never,
    loyalty as never,
  );

  const admin = {
    id: 7n,
    name: 'Admin',
    email: 'admin@example.com',
    phone: null,
    phoneCode: null,
    password: 'hash',
    userType: 'admin',
    isEmailVerified: true,
    isPhoneVerified: false,
    isActive: true,
    role: {
      id: 1n,
      translations: [{ id: 1n, recordId: 1n, langId: 'en', name: 'Admin' }],
      permissions: [],
    },
  } as unknown as AuthUserPayload;

  beforeEach(() => {
    jest.clearAllMocks();
    jwt.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
    refreshTokens.create.mockResolvedValue({ id: 55n });
    anonymousSessions.claim.mockResolvedValue(undefined);
  });

  it('returns an admin session id and explicit user type after password login', async () => {
    const result = await service.login(admin, 'Edge', '127.0.0.1');

    expect(result).toEqual(
      expect.objectContaining({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        sessionId: '55',
        user: expect.objectContaining({ userType: 'admin' }),
      }),
    );
    expect(refreshTokens.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 7n, deviceInfo: 'Edge', ipAddress: '127.0.0.1' }),
    );
  });

  it('rejects password authentication for a non-admin account', async () => {
    users.findOne.mockResolvedValue({ ...admin, userType: 'client' });
    await expect(service.validateUser('client@example.com', 'password')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('consumes a refresh token once and preserves its device metadata', async () => {
    jwt.decode.mockReturnValue({ sub: '7', jti: 'old-token-id', type: 'refresh' });
    refreshTokens.consumeActiveToken.mockResolvedValue({
      id: 12n,
      deviceInfo: 'Chrome on Windows',
      ipAddress: '10.0.0.5',
    });

    const result = await service.refreshAccessToken(admin, 'old-refresh-token');

    expect(refreshTokens.consumeActiveToken).toHaveBeenCalledWith('old-token-id', 7n);
    expect(refreshTokens.create).toHaveBeenCalledWith(
      expect.objectContaining({ deviceInfo: 'Chrome on Windows', ipAddress: '10.0.0.5' }),
    );
    expect(result.sessionId).toBe('55');
  });

  it('rejects reuse after another request has consumed the refresh token', async () => {
    jwt.decode.mockReturnValue({ sub: '7', jti: 'old-token-id', type: 'refresh' });
    refreshTokens.consumeActiveToken.mockResolvedValue(null);

    await expect(service.refreshAccessToken(admin, 'old-refresh-token')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(refreshTokens.create).not.toHaveBeenCalled();
  });

  it('sets the admin cookie and clears the legacy cookie during migration', () => {
    const response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn(),
      json: jest.fn(),
    };
    response.status.mockReturnValue(response);

    service.handleAuthResponse(
      response as never,
      {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        sessionId: '55',
        user: {
          id: '7',
          userType: 'admin',
          isEmailVerified: true,
          isPhoneVerified: false,
        },
      },
      'browser',
      'refreshToken',
    );

    expect(response.cookie).toHaveBeenCalledWith('adminRefreshToken', 'refresh-token', expect.any(Object));
    expect(response.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ session_id: '55' }));
  });

  it('does not let one user revoke another user refresh token during logout', async () => {
    jwt.decode.mockReturnValue({ sub: '8', jti: 'other-token-id', type: 'refresh' });
    await expect(service.logout(7n, 'other-refresh-token')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(refreshTokens.revokeByToken).not.toHaveBeenCalled();
  });

  it('returns not found when a session is missing, expired, or not owned by the user', async () => {
    refreshTokens.revokeSession.mockResolvedValue(false);
    await expect(service.revokeSession(7n, 99n)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('changes an authenticated administrator password after verifying the current password', async () => {
    const password = await import('bcrypt').then((bcrypt) => bcrypt.hash('current-password', 4));
    users.findOne.mockResolvedValue({ ...admin, password });
    users.update.mockResolvedValue({ ...admin, password: 'updated-password-hash' });

    await expect(service.changePassword(7n, 'current-password', 'new-password')).resolves.toEqual({
      message: 'common.auth_password_changed_successfully',
    });
    expect(users.update).toHaveBeenCalledWith(7n, { password: expect.any(String) });
  });
});
