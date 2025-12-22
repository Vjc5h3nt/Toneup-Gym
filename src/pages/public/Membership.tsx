import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    duration: '1 Month',
    price: 1999,
    originalPrice: null,
    features: [
      'Full gym access',
      'Cardio equipment',
      'Locker & shower',
      'Free parking',
    ],
    popular: false,
  },
  {
    name: 'Standard',
    duration: '3 Months',
    price: 4999,
    originalPrice: 5997,
    features: [
      'Everything in Basic',
      'Group classes access',
      'Fitness assessment',
      'Diet consultation',
    ],
    popular: false,
  },
  {
    name: 'Premium',
    duration: '6 Months',
    price: 8999,
    originalPrice: 11994,
    features: [
      'Everything in Standard',
      '2 PT sessions/month',
      'Nutrition plan',
      'Progress tracking',
      'Priority booking',
    ],
    popular: true,
  },
  {
    name: 'Elite',
    duration: '12 Months',
    price: 14999,
    originalPrice: 23988,
    features: [
      'Everything in Premium',
      '4 PT sessions/month',
      'Personal locker',
      'Guest passes (2/month)',
      'Free merchandise',
      'Freeze option (30 days)',
    ],
    popular: false,
  },
];

const addons = [
  { name: 'Personal Training (per session)', price: 500 },
  { name: 'Personal Training (10 sessions)', price: 4500 },
  { name: 'Yoga Classes (monthly)', price: 999 },
  { name: 'CrossFit (monthly)', price: 1499 },
];

export default function Membership() {
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-primary text-white gap-1">
                      <Star className="h-3 w-3" />
                      Best Value
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.duration}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="text-4xl font-bold">₹{plan.price.toLocaleString()}</div>
                    {plan.originalPrice && (
                      <div className="text-sm text-muted-foreground line-through">
                        ₹{plan.originalPrice.toLocaleString()}
                      </div>
                    )}
                    {plan.originalPrice && (
                      <Badge variant="secondary" className="mt-2">
                        Save ₹{(plan.originalPrice - plan.price).toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  <ul className="space-y-3 text-left mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/enquiry">
                    <Button 
                      className={`w-full ${plan.popular ? 'gradient-primary' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Add-on Services</h2>
            <p className="text-muted-foreground">Enhance your membership with specialized programs</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {addons.map((addon) => (
                    <div key={addon.name} className="flex justify-between items-center py-3 border-b last:border-0">
                      <span>{addon.name}</span>
                      <span className="font-semibold">₹{addon.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
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
