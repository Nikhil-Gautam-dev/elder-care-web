export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
}

export interface GroqTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: ToolDefinition['inputSchema'];
  };
}

export const toolDefinitions: ToolDefinition[] = [
  {
    name: 'get_elder_profile',
    description:
      'Get the profile of the current elderly user, including name, age, address, and preferences.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description:
            'The user ID or a label like "me", "mom", or "dad". Use "me" if the user is asking about themselves.',
        },
      },
      required: ['userId'],
    },
  },
  {
    name: 'get_family_members',
    description:
      'List all family members linked to the elderly user — their names, relationship, and permissions.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The elder user ID whose family members to list.',
        },
      },
      required: ['userId'],
    },
  },
  {
    name: 'get_medication_preference',
    description:
      'Get the preferred pharmacy and any usual medication preference for the elder user.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The elder user ID.',
        },
      },
      required: ['userId'],
    },
  },
  {
    name: 'get_ride_preference',
    description:
      'Get the preferred ride type for the elder user (standard, premium, or accessible).',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The elder user ID.',
        },
      },
      required: ['userId'],
    },
  },
  {
    name: 'send_family_notification',
    description:
      'Send a notification message to the family members of the elder. Only sends to members with canReceiveNotifications enabled.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The elder user ID whose family will be notified.',
        },
        message: {
          type: 'string',
          description: 'The notification message to send to family members.',
        },
      },
      required: ['userId', 'message'],
    },
  },
  {
    name: 'get_pending_invites',
    description: 'Check for any pending family invitations sent by or to the elder user.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The elder user ID.',
        },
      },
      required: ['userId'],
    },
  },
];

export function toGroqTools(definitions: ToolDefinition[]): GroqTool[] {
  return definitions.map((def) => ({
    type: 'function' as const,
    function: {
      name: def.name,
      description: def.description,
      parameters: def.inputSchema,
    },
  }));
}
