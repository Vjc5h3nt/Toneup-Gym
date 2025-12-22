import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, MessageCircle, Instagram, Facebook } from 'lucide-react';

export default function Contact() {
  const whatsappNumber = '919876543210';
  const whatsappMessage = encodeURIComponent('Hi! I have a question about SmartGym.');
  
  // Google Maps embed coordinates (example: Mumbai)
  const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.0060!2d72.8777!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA0JzMzLjYiTiA3MsKwNTInMzkuNyJF!5e0!3m2!1sen!2sin!4v1234567890';

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-20 gradient-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-lg text-white/80">
              We'd love to hear from you. Reach out anytime!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Map */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Cards */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Our Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    123 Fitness Street,<br />
                    Health City, Maharashtra 400001<br />
                    India
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Phone & WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">+91 98765 43210</p>
                  <a 
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white">
                      <MessageCircle className="h-4 w-4" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href="mailto:info@smartgym.com" 
                    className="text-primary hover:underline"
                  >
                    info@smartgym.com
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Opening Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>5:00 AM - 11:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>6:00 AM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>7:00 AM - 8:00 PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="p-3 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <div className="aspect-square lg:aspect-[4/3]">
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="SmartGym Location"
                  />
                </div>
              </Card>
              
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Ready to start your fitness journey?
                </p>
                <Link to="/enquiry">
                  <Button size="lg" className="gradient-primary">
                    Book a Free Visit
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
