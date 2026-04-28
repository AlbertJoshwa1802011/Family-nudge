import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/prisma', () => {
  const mockPrisma = {
    notification: {
      create: vi.fn().mockResolvedValue({ id: 'notif-1' }),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

const { prisma } = await import('../lib/prisma');

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.notification.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'notif-1',
    });
  });

  it('creates a notification record and marks it SENT for PUSH channel', async () => {
    const { NotificationService } = await import('../services/notification.service');
    const svc = new NotificationService();

    await svc.send({
      userId: 'user-1',
      channel: 'PUSH',
      title: 'Test',
      body: 'Test body',
    });

    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          channel: 'PUSH',
          status: 'PENDING',
        }),
      }),
    );

    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'notif-1' },
        data: expect.objectContaining({ status: 'SENT' }),
      }),
    );
  });

  it('marks notification as FAILED when SMS sent without phone', async () => {
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'user-1',
      phone: null,
    });

    const { NotificationService } = await import('../services/notification.service');
    const svc = new NotificationService();

    await svc.send({
      userId: 'user-1',
      channel: 'SMS',
      title: 'Test',
      body: 'Test body',
    });

    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' }),
      }),
    );
  });
});
