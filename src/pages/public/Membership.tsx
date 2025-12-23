import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Loader2 } from 'lucide-react';

interface MembershipPlan {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  description: string | null;
  is_active: boolean;
}

export default function Membership() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('duration_months', { ascending: true });

      if (error) throw error;
      setPlans((data as MembershipPlan[]) || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Find the best value plan (longest duration)
  const bestValuePlan = plans.reduce((prev, current) => 
    (current.duration_months > (prev?.duration_months || 0)) ? current : prev
  , plans[0]);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-20 gradient-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Membership Plans</h1>
            <p className="text-lg text-white/80">
              Choose the perfect plan for your fitness journey
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No membership plans available at the moment.</p>
              <p className="text-sm mt-2">Please check back later or contact us for more information.</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${plans.length <= 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : plans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
              {plans.map((plan) => {
                const isBestValue = plan.id === bestValuePlan?.id && plans.length > 1;
                const monthlyRate = Math.round(plan.price / plan.duration_months);
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative ${isBestValue ? 'border-primary shadow-xl scale-105' : ''}`}
                  >
                    {isBestValue && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="gradient-primary text-white gap-1">
                          <Star className="h-3 w-3" />
                          Best Value
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>
                        {plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="mb-6">
                        <div className="text-4xl font-bold">₹{plan.price.toLocaleString()}</div>
                        {plan.duration_months > 1 && (
                          <div className="text-sm text-muted-foreground mt-1">
                            ₹{monthlyRate.toLocaleString()}/month
                          </div>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mb-6 text-left">
                          {plan.description}
                        </p>
                      )}
                      <ul className="space-y-3 text-left mb-6">
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Full gym access</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">All equipment included</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Locker & shower facilities</span>
                        </li>
                        {plan.duration_months >= 6 && (
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Free fitness assessment</span>
                          </li>
                        )}
                        {plan.duration_months >= 12 && (
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Personal training session</span>
                          </li>
                        )}
                      </ul>
                      <Link to="/enquiry">
                        <Button 
                          className={`w-full ${isBestValue ? 'gradient-primary' : ''}`}
                          variant={isBestValue ? 'default' : 'outline'}
                        >
                          Get Started
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Not Sure Which Plan?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Visit us for a free consultation and tour. Our team will help you 
            choose the perfect plan based on your goals.
          </p>
          <Link to="/enquiry">
            <Button size="lg" className="gradient-primary">Book a Free Visit</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
