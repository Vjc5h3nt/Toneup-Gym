import { Card, CardContent } from '@/components/ui/card';
import { Target, Heart, Award, Users } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Results Focused',
    description: 'Every program is designed with measurable outcomes in mind.',
  },
  {
    icon: Heart,
    title: 'Member First',
    description: 'Your success and satisfaction are our top priorities.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We maintain the highest standards in equipment and training.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'A supportive environment where everyone belongs.',
  },
];

export default function About() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-20 gradient-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About SmartGym</h1>
            <p className="text-lg text-white/80">
              Building stronger bodies and minds since 2014
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  SmartGym was founded in 2014 with a simple mission: to create a fitness 
                  environment where everyone feels welcome and empowered to achieve their goals.
                </p>
                <p>
                  What started as a small neighborhood gym has grown into a premier fitness 
                  destination, serving over 500 active members with state-of-the-art equipment 
                  and world-class trainers.
                </p>
                <p>
                  Our philosophy is built on the belief that fitness is not just about physical 
                  transformation—it's about building confidence, discipline, and a community 
                  that supports each other.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800"
                  alt="Gym interior"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 gradient-primary p-6 rounded-xl text-white">
                <div className="text-4xl font-bold">10+</div>
                <div>Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              To empower individuals of all fitness levels to achieve their health and 
              wellness goals through exceptional facilities, expert guidance, and a 
              supportive community that celebrates every milestone.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
