import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DAY_SLOTS, FOOD_TIMINGS, MEDICATION_FORMS } from '@eldercare/shared';
import type { AuthContext } from '@eldercare/shared';

import {
  getProfile,
  setAddress,
  getFamilyMembers,
  getPendingInvites,
  getNotifications,
  sendFamilyNotification,
  setAlias,
  listMedications,
  addMedication,
  updateMedication,
  stopMedication,
  searchMedicine,
  prepareOrder,
  placeOrder,
  getOrderStatus,
  cancelOrder,
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
  .describe('Who: "me" (default), a nickname, relationship or name.');

const reply = (result: ToolResult) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(result) }],
  isError: !result.success,
});

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: 'eldercare', version: '0.0.1' });

  const log = (name: string, auth: RawAuth) =>
    console.info(`[MCP] ${name} auth=${auth?.id ?? 'none'}`);

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

  server.registerTool(
    'set_address',
    {
      title: 'Set Home Address',
      description:
        "Save the signed-in user's own home address (used for medicine delivery). Confirm it with the user first.",
      inputSchema: {
        line1: z.string().describe('House number and street.'),
        line2: z.string().optional().describe('Area or landmark.'),
        city: z.string(),
        state: z.string().optional(),
        postalCode: z.string().optional().describe('6-digit PIN code.'),
        auth: authSchema,
      },
    },
    async ({ auth, ...args }) => {
      log('set_address', auth);
      return reply(await setAddress(args, toAuth(auth)));
    },
  );

  // ── Medications ────────────────────────────────────────────────────────────
  const medicationFields = {
    genericName: z.string().optional(),
    strength: z.string().optional().describe('e.g. "500 mg"'),
    form: z.enum(MEDICATION_FORMS).optional(),
    doseAmount: z.number().optional().describe('Per intake'),
    doseUnit: z.string().optional(),
    slots: z.array(z.enum(DAY_SLOTS)).optional(),
    times: z.array(z.string()).optional().describe('HH:mm'),
    food: z.enum(FOOD_TIMINGS).optional(),
    asNeeded: z.boolean().optional(),
    instructions: z.string().optional(),
    unitsPerPack: z.number().optional(),
    unitsOnHand: z.number().optional().describe('How many the person has now'),
    refillAtDays: z.number().optional(),
    prescribedBy: z.string().optional(),
  };

  server.registerTool(
    'list_medications',
    {
      title: 'List Medications',
      description:
        "A person's saved medicines: how to take each one (dose, times, food) and how many days of supply are left.",
      inputSchema: {
        person,
        includeStopped: z.boolean().optional().describe('Also show stopped medicines.'),
        auth: authSchema,
      },
    },
    async ({ person, includeStopped, auth }) => {
      log('list_medications', auth);
      return reply(await listMedications(person, includeStopped ?? false, toAuth(auth)));
    },
  );

  server.registerTool(
    'save_medication',
    {
      title: 'Save Medication',
      description:
        'Add a new medicine (give name; needs dose and when taken — strength, type and pack size are filled from the pharmacy catalog for known brands) or change a saved one (give medication = its name, plus only what changes). Confirm first.',
      inputSchema: {
        person,
        medication: z
          .string()
          .optional()
          .describe('Saved medicine to change. Omit to add a new one.'),
        name: z.string().optional().describe('Name of the new medicine, e.g. "Digene".'),
        ...medicationFields,
        auth: authSchema,
      },
    },
    async ({ person, medication, auth, ...args }) => {
      log('save_medication', auth);
      const who = toAuth(auth);
      if (medication) return reply(await updateMedication(person, medication, args, who));
      if (!args.name)
        return reply({ success: false, error: 'Give the name of the medicine to add.' });
      return reply(await addMedication(person, args, who));
    },
  );

  server.registerTool(
    'stop_medication',
    {
      title: 'Stop Medication',
      description: 'Mark a medicine as stopped (kept in history, never reordered). Confirm first.',
      inputSchema: {
        person,
        medication: z.string().describe('Which saved medicine, by name.'),
        auth: authSchema,
      },
    },
    async ({ person, medication, auth }) => {
      log('stop_medication', auth);
      return reply(await stopMedication(person, medication, toAuth(auth)));
    },
  );

  // ── Pharmacy ───────────────────────────────────────────────────────────────
  server.registerTool(
    'search_medicine',
    {
      title: 'Search Pharmacy',
      description:
        'Search the pharmacy catalog by brand or generic name: pack size, price, in stock.',
      inputSchema: { query: z.string().min(2), auth: authSchema },
    },
    async ({ query, auth }) => {
      log('search_medicine', auth);
      return reply(await searchMedicine(query, toAuth(auth)));
    },
  );

  server.registerTool(
    'prepare_order',
    {
      title: 'Prepare Pharmacy Order',
      description:
        'Step 1 of ordering. Works out exactly what would be ordered (pack sizes, total, address) and returns a draftId. Nothing is ordered yet. For saved medicines omit packs to get about 30 days.',
      inputSchema: {
        person,
        items: z
          .array(
            z.object({
              medication: z.string().optional().describe('A saved medicine, by name.'),
              medicine: z.string().optional().describe('Anything else, e.g. "Crocin 500".'),
              packs: z.number().optional().describe('Number of packs, if the user said.'),
            }),
          )
          .min(1),
        auth: authSchema,
      },
    },
    async ({ person, items, auth }) => {
      log('prepare_order', auth);
      return reply(await prepareOrder(person, items, toAuth(auth)));
    },
  );

  server.registerTool(
    'place_order',
    {
      title: 'Place Pharmacy Order',
      description:
        'Step 2: place exactly the prepared order. Only after the user clearly said yes to the read-back summary.',
      inputSchema: { draftId: z.string(), auth: authSchema },
    },
    async ({ draftId, auth }) => {
      log('place_order', auth);
      return reply(await placeOrder(draftId, toAuth(auth)));
    },
  );

  server.registerTool(
    'get_order_status',
    {
      title: 'Get Order Status',
      description: "Status of a person's recent pharmacy orders (or one by order number).",
      inputSchema: { person, orderNumber: z.string().optional(), auth: authSchema },
    },
    async ({ person, orderNumber, auth }) => {
      log('get_order_status', auth);
      return reply(await getOrderStatus(person, orderNumber, toAuth(auth)));
    },
  );

  server.registerTool(
    'cancel_order',
    {
      title: 'Cancel Order',
      description: 'Cancel a pharmacy order that has not been packed yet. Confirm first.',
      inputSchema: { person, orderNumber: z.string(), auth: authSchema },
    },
    async ({ person, orderNumber, auth }) => {
      log('cancel_order', auth);
      return reply(await cancelOrder(person, orderNumber, toAuth(auth)));
    },
  );

  return server;
}
