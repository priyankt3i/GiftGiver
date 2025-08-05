import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../server/storage";
import { insertEventSchema } from "@shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { anonymousMode, ...rest } = req.body;
      const eventData = insertEventSchema.parse(rest);
      const event = await storage.createEvent({
        ...eventData,
        anonymousMode: anonymousMode !== false ? 1 : 0
      });
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data", error: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.status(405).send('Method not allowed');
  }
}
