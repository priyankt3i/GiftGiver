import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getEvent, joinEvent, type EventResponse } from '@/lib/api';
import { saveParticipantSession } from '@/lib/session';
import { Gift, UserPlus, Users, X } from 'lucide-react';
import { useState } from 'react';

const joinEventSchema = z.object({
  name: z.string().min(1, 'Your name is required'),
  wishlist1: z.string().min(1, 'First wishlist item is required'),
  wishlist2: z.string().min(1, 'Second wishlist item is required'),
  wishlist3: z.string().min(1, 'Third wishlist item is required'),
});

type JoinEventForm = z.infer<typeof joinEventSchema>;

export default function JoinEvent() {
  const { eventId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: event, isLoading, error } = useQuery<EventResponse>({
    queryKey: ['/api/events', eventId],
    enabled: !!eventId,
  });

  const form = useForm<JoinEventForm>({
    resolver: zodResolver(joinEventSchema),
    defaultValues: {
      name: '',
      wishlist1: '',
      wishlist2: '',
      wishlist3: '',
    },
  });

  const joinEventMutation = useMutation({
    mutationFn: (data: { name: string; wishlist: string[] }) => joinEvent(eventId!, data),
    onSuccess: (response) => {
      saveParticipantSession({
        participantId: response.participant.id,
        eventId: response.participant.eventId,
        name: response.participant.name,
      });
      toast({
        title: "Successfully joined!",
        description: `Welcome to ${response.event.name}`,
      });
      setLocation(`/my/${eventId}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to join event",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JoinEventForm) => {
    const wishlist = [data.wishlist1, data.wishlist2, data.wishlist3].filter(Boolean);
    joinEventMutation.mutate({
      name: data.name,
      wishlist,
    });
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
        
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-6" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
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
        
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Event Not Found</h2>
                <p className="text-gray-600">
                  The Secret Santa event you're looking for doesn't exist or may have been removed.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (event.status !== 'waiting') {
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
        
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Gift className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Event No Longer Accepting Participants</h2>
                <p className="text-gray-600">
                  The draw for "{event.name}" has already been completed.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (event.participantCount >= event.maxParticipants) {
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
        
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Event is Full</h2>
                <p className="text-gray-600">
                  "{event.name}" has reached its maximum capacity of {event.maxParticipants} participants.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Secret Santa Event</h2>
          <h3 className="text-xl text-gray-700 mb-4">{event.name}</h3>
          {event.description && (
            <p className="text-gray-600 mb-4">{event.description}</p>
          )}
          <div className="flex justify-center items-center space-x-4">
            <Badge variant="outline" className="px-3 py-1">
              <Users className="w-4 h-4 mr-1" />
              {event.participantCount} / {event.maxParticipants} participants
            </Badge>
            {event.budget && (
              <Badge variant="outline" className="px-3 py-1">
                Budget: {event.budget}
              </Badge>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join the Event</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel className="text-base font-semibold">Wishlist (3 items required)</FormLabel>
                  <p className="text-sm text-gray-600">
                    Add items you'd like to receive. Be specific to help your Secret Santa!
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="wishlist1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wishlist Item 1</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Coffee mug with funny quote" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wishlist2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wishlist Item 2</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Desk plant (succulent or small)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wishlist3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wishlist Item 3</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Nice pen or notebook" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={joinEventMutation.isPending}
                >
                  {joinEventMutation.isPending ? (
                    "Joining Event..."
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Secret Santa
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
