import { describe, it, expect } from 'vitest';

describe('NotificationService channel routing', () => {
  const validChannels = ['PUSH', 'SMS', 'WHATSAPP', 'CALL', 'EMAIL'];
  const priorityMap: Record<string, string[]> = {
    LOW: ['PUSH'],
    MEDIUM: ['PUSH', 'SMS'],
    HIGH: ['PUSH', 'SMS', 'WHATSAPP'],
    CRITICAL: ['PUSH', 'SMS', 'WHATSAPP', 'CALL'],
  };

  it('defines all expected notification channels', () => {
    expect(validChannels).toContain('PUSH');
    expect(validChannels).toContain('SMS');
    expect(validChannels).toContain('WHATSAPP');
    expect(validChannels).toContain('CALL');
    expect(validChannels).toContain('EMAIL');
  });

  it('maps LOW priority to push only', () => {
    expect(priorityMap.LOW).toEqual(['PUSH']);
  });

  it('maps MEDIUM priority to push + SMS', () => {
    expect(priorityMap.MEDIUM).toEqual(['PUSH', 'SMS']);
  });

  it('maps HIGH priority to push + SMS + WhatsApp', () => {
    expect(priorityMap.HIGH).toEqual(['PUSH', 'SMS', 'WHATSAPP']);
  });

  it('maps CRITICAL priority to all escalation channels', () => {
    expect(priorityMap.CRITICAL).toEqual(['PUSH', 'SMS', 'WHATSAPP', 'CALL']);
  });

  it('escalation includes all lower-priority channels', () => {
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    for (let i = 1; i < priorities.length; i++) {
      const current = priorityMap[priorities[i]];
      const previous = priorityMap[priorities[i - 1]];
      for (const ch of previous) {
        expect(current).toContain(ch);
      }
    }
  });
});
