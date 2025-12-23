import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';

const enquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  preferred_call_time: z.string().optional(),
  preferred_visit_time: z.string().optional(),
  interest: z.enum(['normal', 'personal_training', 'yoga', 'crossfit', 'other']),
  expected_duration: z.number().min(1).max(24),
  fitness_goal: z.string().max(500).optional(),
  source: z.enum(['website', 'instagram', 'qr', 'referral', 'walk_in', 'other']),
});

const interests = [
  { value: 'normal', label: 'Gym Membership' },
  { value: 'personal_training', label: 'Personal Training' },
  { value: 'yoga', label: 'Yoga Classes' },
  { value: 'crossfit', label: 'CrossFit' },
  { value: 'other', label: 'Other' },
];

const durations = [
  { value: 1, label: '1 Month' },
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months' },
  { value: 12, label: '12 Months' },
];

const sources = [
  { value: 'website', label: 'Website' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'qr', label: 'QR Code' },
  { value: 'referral', label: 'Friend Referral' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'other', label: 'Other' },
];

// Generate 30-minute time slots from 6:00 AM to 10:00 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    slots.push({ value: `${hourStr}:00`, label: `${displayHour}:00 ${period}` });
    if (hour < 22) {
      slots.push({ value: `${hourStr}:30`, label: `${displayHour}:30 ${period}` });
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export default function Enquiry() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferred_call_time: '',
    preferred_visit_time: '',
    interest: 'normal' as const,
    expected_duration: 1,
    fitness_goal: '',
    source: 'website' as const,
  });
  // Honeypot fields - should remain empty, bots will fill them
  const [honeypot, setHoneypot] = useState({
    website: '',
    company: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = enquirySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Use edge function for rate limiting and server-side validation
      const { data, error } = await supabase.functions.invoke('submit-enquiry', {
        body: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          preferred_call_time: formData.preferred_call_time || null,
          preferred_visit_time: formData.preferred_visit_time || null,
          interest: formData.interest,
          expected_duration: formData.expected_duration,
          fitness_goal: formData.fitness_goal || null,
          source: formData.source,
          // Include honeypot fields - server will reject if filled
          website: honeypot.website,
          company: honeypot.company,
        },
      });

      if (error) throw error;
      
      // Check for rate limit response
      if (data?.error) {
        if (data.error.includes('Too many')) {
          toast.error('Too many submissions. Please try again later.');
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setIsSuccess(true);
      toast.success('Enquiry submitted successfully!');
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your enquiry has been submitted successfully. Our team will contact you within 24 hours.
            </p>
            <Button onClick={() => navigate('/')} className="gradient-primary">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-16 gradient-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book a Visit</h1>
            <p className="text-lg text-white/80">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Enquiry Form</CardTitle>
              <CardDescription>
                Tell us about yourself and your fitness goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                {/* Interest & Duration */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Interested In *</Label>
                    <Select
                      value={formData.interest}
                      onValueChange={(value: typeof formData.interest) => 
                        setFormData({ ...formData, interest: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {interests.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Duration *</Label>
                    <Select
                      value={formData.expected_duration.toString()}
                      onValueChange={(value) => 
                        setFormData({ ...formData, expected_duration: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((item) => (
                          <SelectItem key={item.value} value={item.value.toString()}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Call & Visit Times */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preferred Call Time</Label>
                    <Select
                      value={formData.preferred_call_time}
                      onValueChange={(value) => 
                        setFormData({ ...formData, preferred_call_time: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Visit Date</Label>
                    <Input
                      type="date"
                      value={formData.preferred_visit_time}
                      onChange={(e) => 
                        setFormData({ ...formData, preferred_visit_time: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label>How did you hear about us?</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value: typeof formData.source) => 
                      setFormData({ ...formData, source: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fitness Goal */}
                <div className="space-y-2">
                  <Label>Your Fitness Goal (Optional)</Label>
                {/* Honeypot fields - hidden from users, bots will fill them */}
                <div className="hidden" aria-hidden="true">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot.website}
                    onChange={(e) => setHoneypot({ ...honeypot, website: e.target.value })}
                  />
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot.company}
                    onChange={(e) => setHoneypot({ ...honeypot, company: e.target.value })}
                  />
                </div>

                <Textarea
                    value={formData.fitness_goal}
                    onChange={(e) => setFormData({ ...formData, fitness_goal: e.target.value })}
                    placeholder="Tell us about your fitness goals..."
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Enquiry'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
