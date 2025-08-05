import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../../../../../server/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { eventId, participantId } = req.query;
      
      const event = await storage.getEvent(eventId as string);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const participant = await storage.getParticipant(participantId as string);
      if (!participant || participant.eventId !== eventId) {
        return res.status(404).json({ message: "Participant not found" });
      }

      if (event.status === "waiting") {
        return res.json({
          status: "waiting",
          message: "Draw has not been performed yet"
        });
      }

      const assignment = await storage.getAssignmentForGiver(eventId as string, participantId as string);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      const receiver = await storage.getParticipant(assignment.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }

      res.json({
        status: "assigned",
        receiver: {
          name: receiver.name,
          wishlist: receiver.wishlist
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get assignment", error: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.status(405).send('Method not allowed');
  }
}
