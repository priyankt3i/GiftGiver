import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../../../server/storage";
import { insertParticipantSchema } from "@shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const event = await storage.getEvent(req.query.id as string);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.status !== "waiting") {
        return res.status(400).json({ message: "Event is no longer accepting participants" });
      }

      const currentParticipants = await storage.getParticipantsByEvent(event.id);
      if (currentParticipants.length >= event.maxParticipants) {
        return res.status(400).json({ message: "Event is full" });
      }

      const participantData = insertParticipantSchema.parse({
        ...req.body,
        eventId: event.id
      });

      // Check if participant already exists
      const existingParticipant = await storage.getParticipantByEventAndName(event.id, participantData.name);
      if (existingParticipant) {
        return res.status(400).json({ message: "A participant with this name already exists" });
      }

      const participant = await storage.createParticipant(participantData);
      
      // Store participant ID in session/response for frontend
      res.json({
        participant: {
          id: participant.id,
          name: participant.name,
          eventId: participant.eventId
        },
        event: {
          id: event.id,
          name: event.name,
          status: event.status
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to join event", error: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.status(405).send('Method not allowed');
  }
}
