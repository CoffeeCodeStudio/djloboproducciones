import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Youtube, Facebook, Send } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const translations = {
  sv: {
    title: "Kontakt",
    subtitle: "Har du frågor? Tveka inte att höra av dig!",
    name: "Namn",
    email: "E-post",
    message: "Meddelande",
    send: "Skicka meddelande",
    sending: "Skickar...",
    success: "Tack! Vi återkommer snart.",
    error: "Något gick fel. Försök igen.",
    followUs: "Följ oss",
    location: "Göteborg, Sverige"
  },
  en: {
    title: "Contact",
    subtitle: "Have questions? Don't hesitate to get in touch!",
    name: "Name",
    email: "Email",
    message: "Message",
    send: "Send message",
    sending: "Sending...",
    success: "Thank you! We'll get back to you soon.",
    error: "Something went wrong. Please try again.",
    followUs: "Follow us",
    location: "Gothenburg, Sweden"
  },
  es: {
    title: "Contacto",
    subtitle: "¿Tienes preguntas? ¡No dudes en contactarnos!",
    name: "Nombre",
    email: "Correo electrónico",
    message: "Mensaje",
    send: "Enviar mensaje",
    sending: "Enviando...",
    success: "¡Gracias! Te responderemos pronto.",
    error: "Algo salió mal. Por favor, inténtalo de nuevo.",
    followUs: "Síguenos",
    location: "Gotemburgo, Suecia"
  }
};

const ContactSection = () => {
  const { language } = useLanguage();
  const { branding } = useBranding();
  const { toast } = useToast();
  const t = translations[language];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          message: formData.message
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: t.success,
        variant: "default"
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: t.error,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const instagramUrl = branding?.instagram_username ?
  `https://www.instagram.com/${branding.instagram_username}` :
  "https://www.instagram.com/djloboradio";

  const youtubeUrl = branding?.youtube_channel_id ?
  `https://www.youtube.com/channel/${branding.youtube_channel_id}` :
  "https://www.youtube.com/@djloboradio";

  return (
    <section
      id="kontakt"
      className="py-16 sm:py-24"
      aria-labelledby="contact-title">
      
      <div className="text-center mb-12">
        <h2
          id="contact-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neon-gradient mb-4">
          
          {t.title}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Contact Form */}
        <div className="glass-card p-6 sm:p-8 rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                {t.name}
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background/50 border-muted focus:border-neon-cyan" />
              
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                {t.email}
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-background/50 border-muted focus:border-neon-cyan" />
              
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                {t.message}
              </label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={5}
                className="bg-background/50 border-muted focus:border-neon-cyan resize-none" />
              
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-purple hover:to-neon-cyan transition-all duration-300">
              
              {isSubmitting ?
              t.sending :

              <>
                  <Send className="w-4 h-4 mr-2" />
                  {t.send}
                </>
              }
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        



























































        
      </div>
    </section>);

};

export default ContactSection;