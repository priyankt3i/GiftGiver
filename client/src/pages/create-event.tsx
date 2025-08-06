import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { useToast } from '../hooks/use-toast';
import { createEvent } from '../lib/api';
import { saveOrganizerSession, generateUserId } from '../lib/session';
import { Gift, Users, Calendar } from 'lucide-react';

const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  organizerName: z.string().min(1, 'Your name is required'),
  maxParticipants: z.number().min(2, 'At least 2 participants required').max(100, 'Maximum 100 participants'),
  budget: z.string().optional(),
  exchangeDate: z.string().optional(),
  organizerId: z.string(), // Add organizerId to schema
});

type CreateEventForm = z.infer<typeof createEventSchema>;

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<CreateEventForm>({
    defaultValues: {
      name: '',
      description: '',
      organizerName: '',
      maxParticipants: 10,
      budget: '',
      exchangeDate: '',
      organizerId: '', // Add organizerId to default values
    },
  });

  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventForm) => createEvent(data),
    onSuccess: (response) => {
      toast({
        title: "Event Created",
        description: `Your event "${response.name}" has been created.`,
      });
      setLocation(`/organizer/${response.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to create event",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateEventForm) => {
    const organizerId = generateUserId();
    createEventMutation.mutate({
      ...data,
      organizerId,
      maxParticipants: data.maxParticipants,
      anonymousMode: true,
    });
  };

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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Secret Santa Event</h2>
          <p className="text-gray-600">Set up your gift exchange and invite participants</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Office Christmas Party 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Annual Secret Santa gift exchange for the team"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Participants</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="2" 
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gift Budget (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="$20 - $50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exchangeDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exchange Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600"
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? (
                    "Creating Event..."
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Create Event
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
