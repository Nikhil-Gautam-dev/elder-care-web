export type ToolResult = Record<string, unknown>;

export type ToolFunction = (args: Record<string, unknown>) => Promise<ToolResult>;

const MOCK_USERS: Record<string, ToolResult> = {
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

const MOCK_FAMILY: Record<string, ToolResult[]> = {
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

const getElderProfile: ToolFunction = async (args) => {
  const userId = String(args.userId ?? 'me').toLowerCase();
  console.log(`\n🔧 get_elder_profile  userId=${userId}`);
  const user = MOCK_USERS[userId];

  if (!user) {
    return {
      success: false,
      error: `No profile found for '${userId}'. Try "me", "mom", or "dad".`,
    };
  }

  return { success: true, user };
};

const getFamilyMembers: ToolFunction = async (args) => {
  const userIdKey = String(args.userId ?? 'me').toLowerCase();
  console.log(`\n🔧 get_family_members  userId=${userIdKey}`);

  const resolved = MOCK_USERS[userIdKey];
  const realId = resolved ? String(resolved.userId) : userIdKey;
  const members = MOCK_FAMILY[realId];

  if (!members) {
    return {
      success: false,
      error: `No family members found for '${userIdKey}'.`,
    };
  }

  return { success: true, count: members.length, familyMembers: members };
};

const getMedicationPreference: ToolFunction = async (args) => {
  const userIdKey = String(args.userId ?? 'me').toLowerCase();
  console.log(`\n🔧 get_medication_preference  userId=${userIdKey}`);

  const user = MOCK_USERS[userIdKey];

  if (!user) {
    return {
      success: false,
      error: `No profile found for '${userIdKey}'.`,
    };
  }

  const prefs = user.preferences as Record<string, unknown>;

  return {
    success: true,
    userId: userIdKey,
    usualPharmacy: prefs.usualPharmacy ?? 'Not set',
    notificationChannel: prefs.notificationChannel,
  };
};

const getRidePreference: ToolFunction = async (args) => {
  const userIdKey = String(args.userId ?? 'me').toLowerCase();
  console.log(`\n🔧 get_ride_preference  userId=${userIdKey}`);

  const user = MOCK_USERS[userIdKey];

  if (!user) {
    return {
      success: false,
      error: `No profile found for '${userIdKey}'.`,
    };
  }

  const prefs = user.preferences as Record<string, unknown>;

  return {
    success: true,
    userId: userIdKey,
    preferredRide: prefs.preferredRide ?? 'standard',
  };
};

const sendFamilyNotification: ToolFunction = async (args) => {
  const userIdKey = String(args.userId ?? 'me').toLowerCase();
  const message = String(args.message ?? '');

  console.log(`\n🔧 send_family_notification  userId=${userIdKey}`);
  console.log(`   message: ${message}`);

  const resolved = MOCK_USERS[userIdKey];
  const realId = resolved ? String(resolved.userId) : userIdKey;
  const members = MOCK_FAMILY[realId] ?? [];

  const notified = members
    .filter((m) => m.canReceiveNotifications)
    .map((m) => ({
      name: m.name,
      relationship: m.relationship,
      channel: 'whatsapp',
    }));

  if (notified.length === 0) {
    return {
      success: false,
      error: 'No family members with notifications enabled.',
    };
  }

  return {
    success: true,
    notificationId: `NOTIF-${Math.floor(Math.random() * 100000)}`,
    message,
    deliveredTo: notified,
  };
};

const getPendingInvites: ToolFunction = async (args) => {
  const userIdKey = String(args.userId ?? 'me').toLowerCase();
  console.log(`\n🔧 get_pending_invites  userId=${userIdKey}`);

  return {
    success: true,
    userId: userIdKey,
    pendingInvites: [],
    message: 'No pending family invitations found.',
  };
};

export const toolExecutors: Record<string, ToolFunction> = {
  get_elder_profile: getElderProfile,
  get_family_members: getFamilyMembers,
  get_medication_preference: getMedicationPreference,
  get_ride_preference: getRidePreference,
  send_family_notification: sendFamilyNotification,
  get_pending_invites: getPendingInvites,
};
