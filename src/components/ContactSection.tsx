import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { useLocalizedTo } from "@/hooks/useLocalizedTo";
import { Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    privacyConsent: "Genom att skicka godkänner du att din data hanteras enligt vår",
    privacyLink: "integritetspolicy",
    counter: "tecken",
    errors: {
      nameRequired: "Ange ditt namn",
      nameMax: "Max 100 tecken",
      emailInvalid: "Ogiltig e-postadress",
      emailMax: "Max 255 tecken",
      messageRequired: "Skriv ett meddelande",
      messageMin: "Minst 10 tecken",
      messageMax: "Max 2000 tecken",
    },
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
    privacyConsent: "By submitting, you agree that your data is handled according to our",
    privacyLink: "privacy policy",
    counter: "characters",
    errors: {
      nameRequired: "Please enter your name",
      nameMax: "Max 100 characters",
      emailInvalid: "Invalid email address",
      emailMax: "Max 255 characters",
      messageRequired: "Please write a message",
      messageMin: "At least 10 characters",
      messageMax: "Max 2000 characters",
    },
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
    privacyConsent: "Al enviar, aceptas que tus datos se manejen según nuestra",
    privacyLink: "política de privacidad",
    counter: "caracteres",
    errors: {
      nameRequired: "Introduce tu nombre",
      nameMax: "Máx. 100 caracteres",
      emailInvalid: "Correo electrónico no válido",
      emailMax: "Máx. 255 caracteres",
      messageRequired: "Escribe un mensaje",
      messageMin: "Mínimo 10 caracteres",
      messageMax: "Máx. 2000 caracteres",
    },
  },
};

const MESSAGE_MAX = 2000;

/** Build a localized zod schema so error messages match the active language. */
const buildSchema = (e: typeof translations["sv"]["errors"]) =>
  z.object({
    name: z.string().trim().min(1, e.nameRequired).max(100, e.nameMax),
    email: z.string().trim().email(e.emailInvalid).max(255, e.emailMax),
    message: z
      .string()
      .trim()
      .min(1, e.messageRequired)
      .min(10, e.messageMin)
      .max(MESSAGE_MAX, e.messageMax),
  });

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const ContactSection = () => {
  const { language } = useLanguage();
  const lto = useLocalizedTo();
  const t = translations[language];

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = buildSchema(t.errors).safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: parsed.data,
      });
      if (error) throw error;

      toast.success(t.success);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Error sending contact form:", err);
      toast.error(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (hasError: boolean) =>
    `bg-background/50 ${hasError ? "border-destructive focus:border-destructive" : "border-muted focus:border-neon-cyan"}`;

  return (
    <section id="kontakt" className="py-16 sm:py-24" aria-labelledby="contact-title">
      <div className="text-center mb-12">
        <h2
          id="contact-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neon-gradient mb-4"
        >
          {t.title}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="glass-card p-6 sm:p-8 rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-2">
                {t.name}
              </label>
              <Input
                id="contact-name"
                type="text"
                maxLength={100}
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                className={fieldClass(!!errors.name)}
              />
              {errors.name && (
                <p id="contact-name-error" className="mt-1 text-xs text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">
                {t.email}
              </label>
              <Input
                id="contact-email"
                type="email"
                maxLength={255}
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                className={fieldClass(!!errors.email)}
              />
              {errors.email && (
                <p id="contact-email-error" className="mt-1 text-xs text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-2">
                {t.message}
              </label>
              <Textarea
                id="contact-message"
                rows={5}
                maxLength={MESSAGE_MAX}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "contact-message-error" : "contact-message-counter"}
                className={`${fieldClass(!!errors.message)} resize-none`}
              />
              <div className="mt-1 flex items-center justify-between text-xs">
                {errors.message ? (
                  <p id="contact-message-error" className="text-destructive">
                    {errors.message}
                  </p>
                ) : (
                  <span />
                )}
                <span id="contact-message-counter" className="text-muted-foreground tabular-nums">
                  {formData.message.length}/{MESSAGE_MAX} {t.counter}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-purple hover:to-neon-cyan transition-all duration-300"
            >
              {isSubmitting ? (
                t.sending
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t.send}
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground mt-3">
              {t.privacyConsent}{" "}
              <Link to={lto("/privacy")} className="text-neon-cyan hover:underline">
                {t.privacyLink}
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
