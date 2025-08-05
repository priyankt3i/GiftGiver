import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../../server/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const event = await storage.getEvent(req.query.id as string);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const participants = await storage.getParticipantsByEvent(event.id);
      
      res.json({
        ...event,
        participantCount: participants.length,
        participants: participants.map(p => ({
          id: p.id,
          name: p.name,
          joinedAt: p.joinedAt
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get event", error: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.status(405).send('Method not allowed');
  }
}
