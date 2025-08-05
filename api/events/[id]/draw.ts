import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../../../server/storage";
import { randomUUID } from "crypto";

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateSecretSantaAssignments(participantIds: string[]) {
  if (participantIds.length < 2) {
    throw new Error("Need at least 2 participants for Secret Santa");
  }

  let assignments: Array<{giverId: string, receiverId: string}> = [];
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const shuffled = shuffle(participantIds);
    const valid = !shuffled.some((receiverId, i) => receiverId === participantIds[i]);
    
    if (valid) {
      assignments = participantIds.map((giverId, i) => ({
        giverId,
        receiverId: shuffled[i]
      }));
      break;
    }
    attempts++;
  }

  if (assignments.length === 0) {
    throw new Error("Could not generate valid Secret Santa assignments");
  }

  return assignments;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const event = await storage.getEvent(req.query.id as string);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.status !== "waiting") {
        return res.status(400).json({ message: "Draw has already been performed" });
      }

      const participants = await storage.getParticipantsByEvent(event.id);
      if (participants.length < 2) {
        return res.status(400).json({ message: "Need at least 2 participants to run draw" });
      }

      if (participants.length < event.maxParticipants) {
        return res.status(400).json({ message: "Waiting for all participants to join" });
      }

      const participantIds = participants.map(p => p.id);
      const assignmentPairs = generateSecretSantaAssignments(participantIds);
      
      const assignments = await storage.createAssignments(
        assignmentPairs.map(pair => ({
          eventId: event.id,
          giverId: pair.giverId,
          receiverId: pair.receiverId
        }))
      );

      await storage.updateEventStatus(event.id, "drawn");

      res.json({ 
        message: "Draw completed successfully",
        assignmentCount: assignments.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to run draw", error: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.status(405).send('Method not allowed');
  }
}
