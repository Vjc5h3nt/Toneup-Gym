import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const galleryImages = [
  {
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    title: 'Strength Training Area',
  },
  {
    url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
    title: 'Cardio Zone',
  },
  {
    url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
    title: 'Modern Equipment',
  },
  {
    url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    title: 'Functional Training',
  },
  {
    url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
    title: 'Yoga Studio',
  },
  {
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    title: 'Group Classes',
  },
  {
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    title: 'Personal Training',
  },
  {
    url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800',
    title: 'Dumbbells Rack',
  },
  {
    url: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800',
    title: 'Workout Session',
  },
];

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openImage = (index: number) => setSelectedIndex(index);
  const closeImage = () => setSelectedIndex(null);
  
  const nextImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % galleryImages.length);
    }
  };
  
  const prevImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-20 gradient-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Gallery</h1>
            <p className="text-lg text-white/80">
              Take a virtual tour of our world-class facilities
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => openImage(index)}
                className="aspect-video overflow-hidden rounded-xl group relative"
              >
                <img 
                  src={image.url} 
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white font-medium">{image.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => closeImage()}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
          {selectedIndex !== null && (
            <div className="relative">
              <img 
                src={galleryImages[selectedIndex].url} 
                alt={galleryImages[selectedIndex].title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="absolute top-4 right-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeImage}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                <p className="text-lg font-medium">{galleryImages[selectedIndex].title}</p>
                <p className="text-sm text-white/60 text-center">
                  {selectedIndex + 1} / {galleryImages.length}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
