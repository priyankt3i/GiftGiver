import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getEvent, runDraw } from '@/lib/api';
import { EventHeader } from '@/components/event-header';
import { ParticipantList } from '@/components/participant-list';
import { QRCodeGenerator } from '@/components/qr-code-generator';
import { Gift, Settings, Mail, Download, BarChart3, Trash2 } from 'lucide-react';

export default function OrganizerDashboard() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['/api/events', eventId],
    enabled: !!eventId,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const runDrawMutation = useMutation({
    mutationFn: () => runDraw(eventId!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      toast({
        title: "Draw completed successfully!",
        description: `${data.assignmentCount} assignments created. Participants can now see their matches.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to run draw",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleRunDraw = () => {
    if (!event) return;
    
    if (event.participantCount < event.maxParticipants) {
      toast({
        title: "Cannot run draw yet",
        description: `Waiting for ${event.maxParticipants - event.participantCount} more participants to join.`,
        variant: "destructive",
      });
      return;
    }

    runDrawMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
        <header className="bg-white shadow-sm border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Gift className="text-red-500 text-2xl" />
                <h1 className="text-xl font-bold text-gray-900">Secret Santa</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full" />
              </div>
              <div>
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
        <header className="bg-white shadow-sm border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Gift className="text-red-500 text-2xl" />
                <h1 className="text-xl font-bold text-gray-900">Secret Santa</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Event Not Found</h2>
                <p className="text-gray-600">
                  The event you're looking for doesn't exist or may have been removed.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const canRunDraw = event.status === 'waiting' && event.participantCount === event.maxParticipants;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Gift className="text-red-500 text-2xl" />
              <h1 className="text-xl font-bold text-gray-900">Secret Santa</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {event.organizerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{event.organizerName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Header */}
        <div className="mb-8">
          <EventHeader
            event={event}
            onRunDraw={handleRunDraw}
            canRunDraw={canRunDraw}
            isRunningDraw={runDrawMutation.isPending}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Participants and Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <ParticipantList
              participants={event.participants}
              maxParticipants={event.maxParticipants}
              status={event.status}
            />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.participants
                    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
                    .slice(0, 5)
                    .map((participant, index) => (
                      <div key={participant.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Gift className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {participant.name} joined the event
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(participant.joinedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {event.participants.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No participants yet. Share the invite link to get started!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: QR Code and Settings */}
          <div className="space-y-6">
            <QRCodeGenerator eventId={event.id} eventName={event.name} />

            {/* Event Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Event Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Max Participants</span>
                  <span className="text-sm text-gray-900">{event.maxParticipants}</span>
                </div>
                {event.budget && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Gift Budget</span>
                    <span className="text-sm text-gray-900">{event.budget}</span>
                  </div>
                )}
                {event.exchangeDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Exchange Date</span>
                    <span className="text-sm text-gray-900">
                      {new Date(event.exchangeDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Anonymous Mode</span>
                  <div className="flex items-center">
                    <div className={`w-8 h-5 rounded-full relative cursor-pointer ${
                      event.anonymousMode ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                        event.anonymousMode ? 'right-0.5' : 'left-0.5'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  disabled
                >
                  <Mail className="w-4 h-4 mr-3" />
                  Send Reminders
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  disabled
                >
                  <Download className="w-4 h-4 mr-3" />
                  Download Participant List
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  disabled
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  View Statistics
                </Button>
                <div className="border-t border-gray-100 pt-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:bg-red-50"
                    disabled
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
