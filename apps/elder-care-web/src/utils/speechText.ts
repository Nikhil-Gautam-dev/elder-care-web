/** Cleans an assistant reply for text-to-speech. The on-screen text is left untouched. */
export function toSpeakableText(reply: string): string {
  return reply
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/₹\s?(\d[\d,.]*)/g, '$1 rupees')
    .replace(/₹/g, 'rupees ')
    .replace(/^\s*(?:[-*•]|\d+[.)])\s+/gm, '')
    .replace(/^#+\s*/gm, '')
    .replace(/[*_`~#>|]/g, '')
    .replace(/\p{Extended_Pictographic}️?/gu, '')
    .replace(/\s*\n+\s*/g, '. ')
    .replace(/\.\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
