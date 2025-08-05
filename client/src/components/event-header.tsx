import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, IdCard, Shuffle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EventHeaderProps {
  event: {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    participantCount: number;
    maxParticipants: number;
    status: string;
  };
  onRunDraw?: () => void;
  canRunDraw?: boolean;
  isRunningDraw?: boolean;
}

export function EventHeader({ event, onRunDraw, canRunDraw, isRunningDraw }: EventHeaderProps) {
  const { toast } = useToast();
  
  const copyEventId = async () => {
    try {
      await navigator.clipboard.writeText(event.id);
      toast({
        title: "Event ID copied!",
        description: "Event ID has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the Event ID manually",
        variant: "destructive",
      });
    }
  };

  const copyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/join/${event.id}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Invite link copied!",
        description: "Invite link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the invite link manually",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    switch (event.status) {
      case 'waiting':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-2" />
            Waiting for participants
          </Badge>
        );
      case 'drawn':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            Draw completed
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Gift className="w-4 h-4 mr-2" />
            Event completed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-green-500 px-6 py-8 text-white relative">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <div className="text-6xl">❄️</div>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">{event.name}</h2>
          {event.description && (
            <p className="text-red-100 mb-4">{event.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(event.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{event.participantCount} of {event.maxParticipants} participants</span>
            </div>
            <div className="flex items-center space-x-2 cursor-pointer" onClick={copyEventId}>
              <IdCard className="w-4 h-4" />
              <span>Event ID: {event.id}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status and Actions */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center space-x-4">
            {getStatusBadge()}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>{event.participantCount} joined</span>
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <span>{event.maxParticipants - event.participantCount} remaining</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={copyInviteLink}
              className="flex items-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Invite Link</span>
            </Button>
            {onRunDraw && (
              <Button 
                onClick={onRunDraw}
                disabled={!canRunDraw || isRunningDraw}
                className="bg-red-500 hover:bg-red-600 flex items-center space-x-2"
              >
                <Shuffle className="w-4 h-4" />
                <span>{isRunningDraw ? 'Running Draw...' : 'Run Draw'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
