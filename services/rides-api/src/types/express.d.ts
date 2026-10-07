declare global {
  namespace Express {
    interface Request {
      staff?: { id: string; username: string; name: string };
      /** True when the request was authenticated with the partner API key. */
      isPartner?: boolean;
    }
  }
}

export {};
