import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, Clock, MapPin, Music, Send, CalendarIcon, Info, MessageCircle, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const eventTypes = [
  { value: "wedding", label: { sv: "Bröllop", en: "Wedding", es: "Boda" } },
  { value: "corporate", label: { sv: "Företagsevent", en: "Corporate Event", es: "Evento Corporativo" } },
  { value: "private", label: { sv: "Privatfest", en: "Private Party", es: "Fiesta Privada" } },
  { value: "club", label: { sv: "Klubb/Festival", en: "Club/Festival", es: "Club/Festival" } },
  { value: "other", label: { sv: "Annat", en: "Other", es: "Otro" } },
];

type FormMode = "question" | "booking";

const translations = {
  sv: {
    title: "Kontakt & Bokning",
    subtitle: "Fyll i formuläret så återkommer vi inom 24 timmar med ett Personligt prisförslag",
    questionTab: "Ställ en fråga",
    bookingTab: "Boka DJ",
    name: "Ditt namn",
    email: "E-postadress",
    phone: "Telefonnummer (valfritt)",
    eventType: "Typ av event",
    eventDate: "Datum för eventet",
    location: "Plats (stad/lokal)",
    message: "Berätta mer om ditt event",
    questionMessage: "Vad vill du veta?",
    submitBooking: "Skicka bokningsförfrågan",
    submitQuestion: "Skicka fråga",
    submitting: "Skickar...",
    successBooking: "Tack för din bokningsförfrågan! Vi återkommer snart.",
    successQuestion: "Tack för din fråga! Vi återkommer snart.",
    error: "Något gick fel. Vänligen försök igen.",
    selectType: "Välj eventtyp",
    whyBook: "Varför boka DJ Lobo?",
    reason1: "Över 20 års erfarenhet",
    reason2: "Professionell utrustning",
    reason3: "Flexibel och anpassar musiken",
    reason4: "Konkurrensmässiga priser",
    disclaimer: "En inskickad förfrågan är inte en bekräftad bokning. Pris och tillgänglighet bekräftas via e-post.",
    privacyConsent: "Genom att skicka godkänner du att din data hanteras enligt vår",
    privacyLink: "integritetspolicy",
  },
  en: {
    title: "Contact & Booking",
    subtitle: "Fill in the form and we'll get back to you within 24 hours with a personalized quote",
    questionTab: "Ask a question",
    bookingTab: "Book DJ",
    name: "Your name",
    email: "Email address",
    phone: "Phone number (optional)",
    eventType: "Event type",
    eventDate: "Event date",
    location: "Location (city/venue)",
    message: "Tell us more about your event",
    questionMessage: "What would you like to know?",
    submitBooking: "Send booking request",
    submitQuestion: "Send question",
    submitting: "Sending...",
    successBooking: "Thank you for your booking request! We'll get back to you soon.",
    successQuestion: "Thank you for your question! We'll get back to you soon.",
    error: "Something went wrong. Please try again.",
    selectType: "Select event type",
    whyBook: "Why book DJ Lobo?",
    reason1: "Over 20 years of experience",
    reason2: "Professional equipment",
    reason3: "Flexible and adapts the music",
    reason4: "Competitive prices",
    disclaimer: "A submitted request is not a confirmed booking. Price and availability will be confirmed via email.",
    privacyConsent: "By submitting, you agree that your data is handled according to our",
    privacyLink: "privacy policy",
  },
  es: {
    title: "Contacto y Reserva",
    subtitle: "Completa el formulario y te responderemos en 24 horas con una cotización personalizada",
    questionTab: "Hacer una pregunta",
    bookingTab: "Reservar DJ",
    name: "Tu nombre",
    email: "Correo electrónico",
    phone: "Teléfono (opcional)",
    eventType: "Tipo de evento",
    eventDate: "Fecha del evento",
    location: "Ubicación (ciudad/local)",
    message: "Cuéntanos más sobre tu evento",
    questionMessage: "¿Qué te gustaría saber?",
    submitBooking: "Enviar solicitud de reserva",
    submitQuestion: "Enviar pregunta",
    submitting: "Enviando...",
    successBooking: "¡Gracias por tu solicitud! Te responderemos pronto.",
    successQuestion: "¡Gracias por tu pregunta! Te responderemos pronto.",
    error: "Algo salió mal. Por favor, inténtalo de nuevo.",
    selectType: "Seleccionar tipo de evento",
    whyBook: "¿Por qué reservar a DJ Lobo?",
    reason1: "Más de 20 años de experiencia",
    reason2: "Equipo profesional",
    reason3: "Flexible y adapta la música",
    reason4: "Precios competitivos",
    disclaimer: "Una solicitud enviada no es una reserva confirmada. El precio y la disponibilidad se confirman por correo electrónico.",
    privacyConsent: "Al enviar, aceptas que tus datos se manejen según nuestra",
    privacyLink: "política de privacidad",
  },
};

const BookingSection = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];

  const [mode, setMode] = useState<FormMode>("booking");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: undefined as Date | undefined,
    location: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isBooking = mode === "booking";

      const { error } = await supabase.from("bookings").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        event_type: isBooking ? formData.eventType : "inquiry",
        event_date: isBooking && formData.eventDate ? format(formData.eventDate, "yyyy-MM-dd") : null,
        location: isBooking ? (formData.location || null) : null,
        message: formData.message || null,
      });

      if (error) throw error;

      supabase.functions.invoke("send-booking-notification", {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          eventType: isBooking ? formData.eventType : "inquiry",
          eventDate: isBooking && formData.eventDate ? format(formData.eventDate, "yyyy-MM-dd") : undefined,
          location: isBooking ? (formData.location || undefined) : undefined,
          message: formData.message || undefined,
        },
      }).catch((err) => console.error("Booking notification failed:", err));

      toast({
        title: isBooking ? t.successBooking : t.successQuestion,
        variant: "default",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        eventType: "",
        eventDate: undefined,
        location: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: t.error,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBooking = mode === "booking";

  return (
    <section
      id="boka"
      className="py-16 sm:py-24"
      aria-labelledby="booking-title"
    >
      <div className="text-center mb-12">
        <h2
          id="booking-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neon-gradient mb-4"
        >
          {t.title}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-xl">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-8">
            <button
              type="button"
              onClick={() => setMode("question")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200",
                mode === "question"
                  ? "bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                  : "bg-background/30 border border-muted text-muted-foreground hover:border-muted-foreground/50"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              {t.questionTab}
            </button>
            <button
              type="button"
              onClick={() => setMode("booking")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200",
                mode === "booking"
                  ? "bg-gradient-to-r from-neon-pink/20 to-neon-purple/10 border border-neon-pink/50 text-neon-pink shadow-[0_0_15px_rgba(255,0,128,0.15)]"
                  : "bg-background/30 border border-muted text-muted-foreground hover:border-muted-foreground/50"
              )}
            >
              <CalendarCheck className="w-4 h-4" />
              {t.bookingTab}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="booking-name" className="block text-sm font-medium text-foreground mb-2">
                {t.name} *
              </label>
              <Input
                id="booking-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background/50 border-muted focus:border-neon-pink"
              />
            </div>

            <div>
              <label htmlFor="booking-email" className="block text-sm font-medium text-foreground mb-2">
                {t.email} *
              </label>
              <Input
                id="booking-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-background/50 border-muted focus:border-neon-pink"
              />
            </div>

            <div className={isBooking ? "" : "sm:col-span-2"}>
              <label htmlFor="booking-phone" className="block text-sm font-medium text-foreground mb-2">
                {t.phone}
              </label>
              <Input
                id="booking-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-background/50 border-muted focus:border-neon-pink"
              />
            </div>

            {isBooking && (
              <>
                <div>
                  <label htmlFor="booking-event-type" className="block text-sm font-medium text-foreground mb-2">
                    {t.eventType} *
                  </label>
                  <select
                    id="booking-event-type"
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-md bg-background/50 border border-muted focus:border-neon-pink focus:outline-none focus:ring-1 focus:ring-neon-pink text-foreground"
                  >
                    <option value="">{t.selectType}</option>
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label[language]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.eventDate} *
                  </label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background/50 border-muted hover:border-neon-pink",
                          !formData.eventDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.eventDate ? format(formData.eventDate, "PPP") : t.eventDate}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={formData.eventDate}
                        onSelect={(date) => { setFormData({ ...formData, eventDate: date }); setDateOpen(false); }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label htmlFor="booking-location" className="block text-sm font-medium text-foreground mb-2">
                    {t.location}
                  </label>
                  <Input
                    id="booking-location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-background/50 border-muted focus:border-neon-pink"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label htmlFor="booking-message" className="block text-sm font-medium text-foreground mb-2">
                {isBooking ? t.message : t.questionMessage} {!isBooking && "*"}
              </label>
              <Textarea
                id="booking-message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required={!isBooking}
                rows={4}
                className="bg-background/50 border-muted focus:border-neon-pink resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto book-now-button px-8 py-3 text-lg font-semibold rounded-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink transition-all duration-300"
              >
                {isSubmitting ? (
                  t.submitting
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {isBooking ? t.submitBooking : t.submitQuestion}
                  </>
                )}
              </Button>
            </div>
            <div className="sm:col-span-2 space-y-3">
              {isBooking && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-neon-pink/70" />
                  <p>{t.disclaimer}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {t.privacyConsent}{" "}
                <Link to="/privacy" className="text-neon-cyan hover:underline">{t.privacyLink}</Link>.
              </p>
            </div>
          </form>
        </div>

        {/* Why Book */}
        <div className="space-y-4">
          <h3 className="text-xl font-display font-bold text-foreground mb-6">
            {t.whyBook}
          </h3>
          
          <div className="glass-card p-4 rounded-xl flex items-center gap-4 hover:border-neon-pink/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-neon-pink/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-neon-pink" />
            </div>
            <span className="text-foreground/90">{t.reason1}</span>
          </div>

          <div className="glass-card p-4 rounded-xl flex items-center gap-4 hover:border-neon-cyan/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center">
              <Music className="w-5 h-5 text-neon-cyan" />
            </div>
            <span className="text-foreground/90">{t.reason2}</span>
          </div>

          <div className="glass-card p-4 rounded-xl flex items-center gap-4 hover:border-neon-purple/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-neon-purple/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-neon-purple" />
            </div>
            <span className="text-foreground/90">{t.reason3}</span>
          </div>

          <div className="glass-card p-4 rounded-xl flex items-center gap-4 hover:border-neon-pink/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-neon-pink/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-neon-pink" />
            </div>
            <span className="text-foreground/90">{t.reason4}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
