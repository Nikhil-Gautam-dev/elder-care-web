// Extend Express Request with authenticated user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phone: string;
        role: 'user' | 'admin';
      };
    }
  }
}

export {};
