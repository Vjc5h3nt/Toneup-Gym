import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dumbbell, 
  Bike, 
  Heart, 
  Waves, 
  Users, 
  Sparkles,
  ShowerHead,
  Car
} from 'lucide-react';

const facilities = [
  {
    icon: Dumbbell,
    title: 'Strength Training Zone',
    description: 'Over 50 machines and a complete free weights section with Olympic platforms.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
  },
  {
    icon: Bike,
    title: 'Cardio Area',
    description: 'Latest treadmills, ellipticals, rowing machines, and stationary bikes.',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600',
  },
  {
    icon: Heart,
    title: 'Functional Training',
    description: 'TRX, battle ropes, kettlebells, and dedicated CrossFit area.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
  },
  {
    icon: Waves,
    title: 'Yoga & Pilates Studio',
    description: 'Climate-controlled studio with premium mats and props.',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600',
  },
  {
    icon: Users,
    title: 'Group Class Room',
    description: 'Spacious room for Zumba, aerobics, and group sessions.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
  },
  {
    icon: Sparkles,
    title: 'Personal Training',
    description: 'Private training areas with specialized equipment.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600',
  },
];

const amenities = [
  { icon: ShowerHead, label: 'Locker & Showers' },
  { icon: Car, label: 'Free Parking' },
  { icon: Sparkles, label: 'AC Throughout' },
  { icon: Heart, label: 'Health Supplements' },
];

export default function Facilities() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-20 gradient-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">World-Class Facilities</h1>
            <p className="text-lg text-white/80">
              Everything you need for a complete fitness experience under one roof
            </p>
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility) => (
              <Card key={facility.title} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={facility.image} 
                    alt={facility.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <facility.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{facility.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{facility.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Amenities</h2>
            <p className="text-muted-foreground">Making your gym experience comfortable</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {amenities.map((amenity) => (
              <div key={amenity.label} className="flex items-center gap-3 bg-background px-6 py-4 rounded-xl shadow-sm">
                <amenity.icon className="h-6 w-6 text-primary" />
                <span className="font-medium">{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hours */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Operating Hours</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Monday - Friday</span>
                    <span className="text-muted-foreground">5:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Saturday</span>
                    <span className="text-muted-foreground">6:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Sunday</span>
                    <span className="text-muted-foreground">7:00 AM - 8:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
