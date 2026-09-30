declare global {
  namespace Express {
    interface Request {
      pharmacist?: { id: string; username: string; name: string };
      /** True when the request was authenticated with the partner API key. */
      isPartner?: boolean;
    }
  }
}

export {};
