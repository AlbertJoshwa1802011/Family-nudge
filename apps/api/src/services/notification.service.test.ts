import { describe, it, expect } from 'vitest';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  it('should instantiate without errors', () => {
    const service = new NotificationService();
    expect(service).toBeDefined();
    expect(service.send).toBeInstanceOf(Function);
    expect(service.sendToMultipleChannels).toBeInstanceOf(Function);
  });
});
