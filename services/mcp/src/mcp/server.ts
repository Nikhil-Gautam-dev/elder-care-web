import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AuthContext } from '@eldercare/shared';

import {
  getProfile,
  getFamilyMembers,
  getPendingInvites,
  getNotifications,
  sendFamilyNotification,
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
    'Who this is about: "me" (default), a relationship like "mom" or "son", or a family member\'s name.',
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
        "List a person's linked family members: name, relationship, phone, and what each is allowed to do (notifications, orders, rides).",
      inputSchema: { person, auth: authSchema },
    },
    async ({ person, auth }) => {
      log('get_family_members', auth);
      return reply(await getFamilyMembers(person, toAuth(auth)));
    },
  );

  server.registerTool(
    'get_pending_invites',
    {
      title: 'Get Pending Invites',
      description:
        'Pending family invitations for the signed-in user: ones they sent and ones sent to them.',
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
        "Send a message to a person's family members who have notifications enabled. Only call after the user has confirmed the exact message.",
      inputSchema: {
        person,
        message: z.string().min(1).describe('The message to send.'),
        auth: authSchema,
      },
    },
    async ({ person, message, auth }) => {
      log('send_family_notification', auth);
      return reply(await sendFamilyNotification(person, message, toAuth(auth)));
    },
  );

  return server;
}
