import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dumbbell, 
  Users, 
  Clock, 
  Trophy, 
  ArrowRight,
  MessageCircle,
  Calendar
} from 'lucide-react';

const features = [
  {
    icon: Dumbbell,
    title: 'Modern Equipment',
    description: 'State-of-the-art machines and free weights for all fitness levels.',
  },
  {
    icon: Users,
    title: 'Expert Trainers',
    description: 'Certified professionals to guide your fitness journey.',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    description: 'Open early morning to late night, 7 days a week.',
  },
  {
    icon: Trophy,
    title: 'Results Driven',
    description: 'Programs designed to help you achieve your goals.',
  },
];

const stats = [
  { value: '500+', label: 'Active Members' },
  { value: '15+', label: 'Expert Trainers' },
  { value: '50+', label: 'Classes Weekly' },
  { value: '10+', label: 'Years Experience' },
];

export default function Home() {
  const whatsappNumber = '919876543210';
  const whatsappMessage = encodeURIComponent('Hi! I am interested in joining SmartGym. Please share more details.');

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920')] bg-cover bg-center opacity-30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Transform Your Body,{' '}
              <span className="text-gradient">Elevate Your Life</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
              Join SmartGym and experience world-class facilities, expert guidance, 
              and a community that motivates you to achieve your fitness goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gradient-primary text-lg gap-2 w-full sm:w-auto">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Us
                </Button>
              </a>
              <Link to="/enquiry">
                <Button size="lg" variant="outline" className="text-lg gap-2 w-full sm:w-auto border-white text-white hover:bg-white hover:text-foreground">
                  <Calendar className="h-5 w-5" />
                  Book a Visit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 gradient-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SmartGym?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to achieve your fitness goals in one place.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join hundreds of members who have transformed their lives with SmartGym.
            Your first step towards a healthier you starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/membership">
              <Button size="lg" className="gradient-primary gap-2">
                View Membership Plans
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="gap-2">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
