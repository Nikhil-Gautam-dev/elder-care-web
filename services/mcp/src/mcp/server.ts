import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AuthContext } from '@eldercare/shared';

import {
  getProfile,
  getFamilyMembers,
  getPendingInvites,
  getNotifications,
  sendFamilyNotification,
  setAlias,
} from '../tools/index.js';
import type { ToolResult } from '../tools/result.js';

const authSchema = z
  .object({
    id: z.string(),
    phone: z.string().optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .optional()
  .describe('Injected by the calling service from the verified login. Never set by the model.');

type RawAuth = z.infer<typeof authSchema>;

const toAuth = (auth: RawAuth): AuthContext | undefined =>
  auth ? { id: auth.id, phone: auth.phone ?? '', role: auth.role ?? 'user' } : undefined;

const person = z
  .string()
  .optional()
  .describe(
    'Who this is about: "me" (default), a nickname the user uses ("Dadu"), a relationship ("mom", "uncle"), or a family member\'s name.',
  );

const reply = (result: ToolResult) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(result) }],
  isError: !result.success,
});

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: 'eldercare', version: '0.0.1' });

  const log = (name: string, auth: RawAuth) =>
    console.log(`[MCP] ${name} auth=${auth?.id ?? 'none'}`);

  server.registerTool(
    'get_profile',
    {
      title: 'Get Profile',
      description:
        "Get a person's profile: name, age, contact, address, language, usual pharmacy, preferred ride, accessibility settings. Works for the signed-in user and their linked family members.",
      inputSchema: { person, auth: authSchema },
    },
    async ({ person, auth }) => {
      log('get_profile', auth);
      return reply(await getProfile(person, toAuth(auth)));
    },
  );

  server.registerTool(
    'get_family_members',
    {
      title: 'Get Family Members',
      description:
        "The user's whole family as one connected group — including relatives connected through others (e.g. a sibling's child). For each person: what they are to the user, nicknames the user uses, phone, who is an elder/admin and their permissions.",
      inputSchema: { auth: authSchema },
    },
    async ({ auth }) => {
      log('get_family_members', auth);
      return reply(await getFamilyMembers(toAuth(auth)));
    },
  );

  server.registerTool(
    'get_pending_invites',
    {
      title: 'Get Pending Invites',
      description:
        "Pending family invitations: ones the user's family has sent (by anyone in it) and ones sent to the user.",
      inputSchema: { auth: authSchema },
    },
    async ({ auth }) => {
      log('get_pending_invites', auth);
      return reply(await getPendingInvites(toAuth(auth)));
    },
  );

  server.registerTool(
    'get_notifications',
    {
      title: 'Get Notifications',
      description:
        'Notifications the signed-in user has received from family (most recent first). Marks unread ones as read.',
      inputSchema: {
        unreadOnly: z.boolean().optional().describe('Only return unread notifications.'),
        auth: authSchema,
      },
    },
    async ({ unreadOnly, auth }) => {
      log('get_notifications', auth);
      return reply(await getNotifications(unreadOnly ?? false, toAuth(auth)));
    },
  );

  server.registerTool(
    'send_family_notification',
    {
      title: 'Send Family Notification',
      description:
        "Send a message to the user's family members who have notifications enabled. Only call after the user has confirmed the exact message.",
      inputSchema: {
        message: z.string().min(1).describe('The message to send.'),
        auth: authSchema,
      },
    },
    async ({ message, auth }) => {
      log('send_family_notification', auth);
      return reply(await sendFamilyNotification(message, toAuth(auth)));
    },
  );

  server.registerTool(
    'set_alias',
    {
      title: 'Set Alias',
      description:
        'Remember a private nickname the user uses for a family member, e.g. "Dadu" for their father, so they can refer to them that way later. Confirm with the user before saving.',
      inputSchema: {
        person: z.string().describe('Who the nickname is for: a name or relationship ("my dad").'),
        alias: z.string().min(1).describe('The nickname the user wants to use.'),
        auth: authSchema,
      },
    },
    async ({ person, alias, auth }) => {
      log('set_alias', auth);
      return reply(await setAlias(person, alias, toAuth(auth)));
    },
  );

  return server;
}
