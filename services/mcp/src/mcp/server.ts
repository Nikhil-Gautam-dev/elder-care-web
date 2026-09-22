import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import {
  getElderProfile,
  getFamilyMembers,
  getMedicationPreference,
  getRidePreference,
  sendFamilyNotification,
  getPendingInvites,
} from '../tools/index.js';

const authSchema = z
  .object({
    id: z.string(),
    phone: z.string().optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .optional();

export function createMcpServer(): McpServer {
  const mcpServer = new McpServer({
    name: 'eldercare',
    version: '0.0.1',
  });

  mcpServer.registerTool(
    'get_elder_profile',
    {
      title: 'Get Elder Profile',
      description:
        'Get the profile of the current elderly user, including name, age, address, and preferences.',
      inputSchema: {
        userId: z
          .string()
          .describe(
            'The user ID or a label like "me", "mom", or "dad". Use "me" if the user is asking about themselves.',
          ),
        auth: authSchema,
      },
    },
    async ({ userId, auth }) => {
      console.log(`[MCP] get_elder_profile(${userId}) auth=`, auth?.id ?? 'none');
      const result = await getElderProfile(
        userId,
        auth ? { id: auth.id, phone: auth.phone ?? '', role: auth.role ?? 'user' } : undefined,
      );
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  );

  mcpServer.registerTool(
    'get_family_members',
    {
      title: 'Get Family Members',
      description:
        'List all family members linked to the elderly user — their names, relationship, and permissions.',
      inputSchema: {
        userId: z.string().describe('The elder user ID whose family members to list.'),
        auth: authSchema,
      },
    },
    async ({ userId, auth }) => {
      console.log(`[MCP] get_family_members(${userId}) auth=`, auth?.id ?? 'none');
      const result = await getFamilyMembers(
        userId,
        auth ? { id: auth.id, phone: auth.phone ?? '', role: auth.role ?? 'user' } : undefined,
      );
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  );

  mcpServer.registerTool(
    'get_medication_preference',
    {
      title: 'Get Medication Preference',
      description:
        'Get the preferred pharmacy and any usual medication preference for the elder user.',
      inputSchema: {
        userId: z.string().describe('The elder user ID.'),
        auth: authSchema,
      },
    },
    async ({ userId, auth }) => {
      console.log(`[MCP] get_medication_preference(${userId}) auth=`, auth?.id ?? 'none');
      const result = await getMedicationPreference(
        userId,
        auth ? { id: auth.id, phone: auth.phone ?? '', role: auth.role ?? 'user' } : undefined,
      );
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  );

  mcpServer.registerTool(
    'get_ride_preference',
    {
      title: 'Get Ride Preference',
      description:
        'Get the preferred ride type for the elder user (standard, premium, or accessible).',
      inputSchema: {
        userId: z.string().describe('The elder user ID.'),
        auth: authSchema,
      },
    },
    async ({ userId, auth }) => {
      console.log(`[MCP] get_ride_preference(${userId}) auth=`, auth?.id ?? 'none');
      const result = await getRidePreference(
        userId,
        auth ? { id: auth.id, phone: auth.phone ?? '', role: auth.role ?? 'user' } : undefined,
      );
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  );

  mcpServer.registerTool(
    'send_family_notification',
    {
      title: 'Send Family Notification',
      description:
        'Send a notification message to the family members of the elder. Only sends to members with canReceiveNotifications enabled. Requires explicit user confirmation before calling.',
      inputSchema: {
        userId: z.string().describe('The elder user ID whose family will be notified.'),
        message: z.string().describe('The notification message to send to family members.'),
        auth: authSchema,
      },
    },
    async ({ userId, message, auth }) => {
      console.log(`[MCP] send_family_notification(${userId}, ...) auth=`, auth?.id ?? 'none');
      const result = await sendFamilyNotification(
        userId,
        message,
        auth ? { id: auth.id, phone: auth.phone ?? '', role: auth.role ?? 'user' } : undefined,
      );
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  );

  mcpServer.registerTool(
    'get_pending_invites',
    {
      title: 'Get Pending Invites',
      description: 'Check for any pending family invitations sent by or to the elder user.',
      inputSchema: {
        userId: z.string().describe('The elder user ID.'),
        auth: authSchema,
      },
    },
    async ({ userId, auth }) => {
      console.log(`[MCP] get_pending_invites(${userId}) auth=`, auth?.id ?? 'none');
      const result = await getPendingInvites(
        userId,
        auth ? { id: auth.id, phone: auth.phone ?? '', role: auth.role ?? 'user' } : undefined,
      );
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  );

  return mcpServer;
}
