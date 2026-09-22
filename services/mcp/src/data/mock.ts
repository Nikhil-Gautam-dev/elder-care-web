export type ToolResult = Record<string, unknown>;

export const MOCK_USERS: Record<string, ToolResult> = {
  me: {
    userId: 'usr_elder_001',
    name: 'Sunita Sharma',
    age: 68,
    phone: '+91 98765 43210',
    email: 'sunita.sharma@example.com',
    address: {
      line1: '14, Green Valley Road',
      city: 'Chandigarh',
      state: 'Punjab',
      postalCode: '160001',
      country: 'India',
    },
    preferences: {
      language: 'en',
      usualPharmacy: 'MedPlus Pharmacy, Sector 17',
      preferredRide: 'accessible',
      notificationChannel: 'whatsapp',
    },
    accessibility: {
      largeText: true,
      voiceEnabled: true,
    },
    status: 'active',
  },
  mom: {
    userId: 'usr_elder_001',
    name: 'Sunita Sharma',
    age: 68,
    phone: '+91 98765 43210',
    preferences: {
      language: 'en',
      usualPharmacy: 'MedPlus Pharmacy, Sector 17',
      preferredRide: 'accessible',
      notificationChannel: 'whatsapp',
    },
    status: 'active',
  },
  dad: {
    userId: 'usr_elder_002',
    name: 'Ramesh Sharma',
    age: 71,
    phone: '+91 98765 11111',
    preferences: {
      language: 'hi',
      usualPharmacy: 'Apollo Pharmacy, Sector 22',
      preferredRide: 'standard',
      notificationChannel: 'sms',
    },
    status: 'active',
  },
};

export const MOCK_FAMILY: Record<string, ToolResult[]> = {
  usr_elder_001: [
    {
      memberId: 'usr_family_001',
      name: 'Arjun Sharma',
      relationship: 'son',
      phone: '+91 99887 76655',
      canReceiveNotifications: true,
      canManageOrders: true,
      canManageRides: true,
      linkedAt: '2025-01-15T10:00:00Z',
    },
    {
      memberId: 'usr_family_002',
      name: 'Priya Sharma',
      relationship: 'daughter',
      phone: '+91 88776 65544',
      canReceiveNotifications: true,
      canManageOrders: false,
      canManageRides: true,
      linkedAt: '2025-02-20T12:00:00Z',
    },
  ],
  usr_elder_002: [
    {
      memberId: 'usr_family_001',
      name: 'Arjun Sharma',
      relationship: 'son',
      phone: '+91 99887 76655',
      canReceiveNotifications: true,
      canManageOrders: true,
      canManageRides: true,
      linkedAt: '2025-01-15T10:00:00Z',
    },
  ],
};
