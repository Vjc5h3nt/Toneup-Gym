import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';

interface Trainer {
  id: string;
  name: string;
  photo_url: string | null;
  specialization: string | null;
  role: string;
}

export default function Trainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('id, name, photo_url, specialization, role')
      .eq('is_active', true)
      .in('role', ['trainer', 'manager'])
      .order('name');

    if (!error && data) {
      setTrainers(data);
    }
    setIsLoading(false);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-20 gradient-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Expert Trainers</h1>
            <p className="text-lg text-white/80">
              Meet the certified professionals dedicated to your fitness success
            </p>
          </div>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-32 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trainers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Our trainer profiles are being updated. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {trainers.map((trainer) => (
                <Card key={trainer.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden bg-muted">
                      {trainer.photo_url ? (
                        <img 
                          src={trainer.photo_url} 
                          alt={trainer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{trainer.name}</h3>
                    <Badge variant="secondary" className="mb-2">
                      {trainer.role.charAt(0).toUpperCase() + trainer.role.slice(1)}
                    </Badge>
                    {trainer.specialization && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {trainer.specialization}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Our Trainers */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Train With Us?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Certified Trainers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5+</div>
              <p className="text-muted-foreground">Years Avg Experience</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Transformations</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
