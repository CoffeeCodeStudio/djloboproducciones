import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageCircle, Users, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { usePresence } from "@/hooks/usePresence";
import { useLanguage } from "@/contexts/LanguageContext";
import { logger } from "@/lib/logger";
import { validateAndCleanMessage, sanitizeMessage } from "@/lib/profanityFilter";

const chatTranslations = {
  sv: {
    liveChat: "LIVE CHAT",
    chatWithListeners: "Chatta med andra lyssnare i realtid!",
    enterNickname: "Ange ditt smeknamn...",
    nicknameLabel: "Ange ditt smeknamn",
    nicknameHelp: "2-20 tecken",
    joinChat: "GÅ MED I CHATTEN",
    invalidName: "Ogiltigt namn",
    nameReserved: "Det namnet är reserverat.",
    nameTooShort: "Ditt smeknamn måste vara minst 2 tecken.",
    nameTooLong: "Ditt smeknamn får vara max 20 tecken.",
    waitAMoment: "Vänta lite",
    sendAgainIn: "Du kan skicka igen om",
    seconds: "sekunder",
    messageTooLong: "Meddelandet är för långt",
    maxChars: "Max",
    charsPerMessage: "tecken per meddelande",
    couldNotSend: "Kunde inte skicka",
    youAreBanned: "Du har blivit avstängd.",
    tryAgain: "Försök igen.",
    noMessagesYet: "Inga meddelanden ännu. Bli först!",
    typeMessage: "Skriv ett meddelande...",
    send: "Skicka",
    chatMessages: "Chattmeddelanden",
    soundForNewMessages: "Ljud för nya meddelanden",
  },
  en: {
    liveChat: "LIVE CHAT",
    chatWithListeners: "Chat with other listeners in real time!",
    enterNickname: "Enter your nickname...",
    nicknameLabel: "Enter your nickname",
    nicknameHelp: "2-20 characters",
    joinChat: "JOIN CHAT",
    invalidName: "Invalid name",
    nameReserved: "That name is reserved.",
    nameTooShort: "Your nickname must be at least 2 characters.",
    nameTooLong: "Your nickname can be max 20 characters.",
    waitAMoment: "Wait a moment",
    sendAgainIn: "You can send again in",
    seconds: "seconds",
    messageTooLong: "Message too long",
    maxChars: "Max",
    charsPerMessage: "characters per message",
    couldNotSend: "Could not send",
    youAreBanned: "You have been banned.",
    tryAgain: "Try again.",
    noMessagesYet: "No messages yet. Be the first!",
    typeMessage: "Type a message...",
    send: "Send",
    chatMessages: "Chat messages",
    soundForNewMessages: "Sound for new messages",
  },
  es: {
    liveChat: "CHAT EN VIVO",
    chatWithListeners: "¡Chatea con otros oyentes en tiempo real!",
    enterNickname: "Ingresa tu apodo...",
    nicknameLabel: "Ingresa tu apodo",
    nicknameHelp: "2-20 caracteres",
    joinChat: "UNIRSE AL CHAT",
    invalidName: "Nombre inválido",
    nameReserved: "Ese nombre está reservado.",
    nameTooShort: "Tu apodo debe tener al menos 2 caracteres.",
    nameTooLong: "Tu apodo puede tener máximo 20 caracteres.",
    waitAMoment: "Espera un momento",
    sendAgainIn: "Puedes enviar de nuevo en",
    seconds: "segundos",
    messageTooLong: "Mensaje muy largo",
    maxChars: "Máximo",
    charsPerMessage: "caracteres por mensaje",
    couldNotSend: "No se pudo enviar",
    youAreBanned: "Has sido baneado.",
    tryAgain: "Inténtalo de nuevo.",
    noMessagesYet: "No hay mensajes aún. ¡Sé el primero!",
    typeMessage: "Escribe un mensaje...",
    send: "Enviar",
    chatMessages: "Mensajes del chat",
    soundForNewMessages: "Sonido para nuevos mensajes",
  },
};

interface ChatMessage {
  id: string;
  nickname: string;
  message: string;
  created_at: string;
}

const QUICK_EMOTES = ["🔥", "❤️", "🎵", "🎧", "💃"];
const DJ_NAMES = ["dj lobo", "djlobo", "lobo"];
const PROTECTED_NAMES = ["admin", "administrator", "dj lobo", "djlobo", "lobo", "lobo radio", "moderator", "mod"];
const RATE_LIMIT_MS = 3000; // 3 seconds between messages
const MAX_MESSAGE_LENGTH = 200;

// Fire animation component
const FireAnimation = ({ show }: { show: boolean }) => {
  if (!show) return null;
  return (
    <span className="inline-block animate-bounce text-lg ml-1">
      <span className="animate-pulse">🔥</span>
    </span>
  );
};

// Badge component
const UserBadge = ({ nickname }: { nickname: string }) => {
  const isDJ = DJ_NAMES.includes(nickname.toLowerCase());
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-1.5" 
      style={{
        background: isDJ 
          ? 'linear-gradient(90deg, hsla(45, 100%, 50%, 0.3), hsla(30, 100%, 50%, 0.3))'
          : 'linear-gradient(90deg, hsla(180, 100%, 50%, 0.2), hsla(220, 100%, 60%, 0.2))',
        border: isDJ 
          ? '1px solid hsla(45, 100%, 50%, 0.5)'
          : '1px solid hsla(180, 100%, 50%, 0.3)',
      }}
    >
      {isDJ ? "👑 DJ" : "🎧"}
    </span>
  );
};

const LiveChat = () => {
  const [nickname, setNickname] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [fireAnimations, setFireAnimations] = useState<Set<string>>(new Set());
  const [sessionId] = useState(() => crypto.randomUUID());
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typeSoundRef = useRef<HTMLAudioElement | null>(null);
  const prevMessageCountRef = useRef(0);
  const cleanupPresenceRef = useRef<(() => void) | null>(null);
  
  const { listenerCount, trackPresence } = usePresence();
  const { language } = useLanguage();
  const t = chatTranslations[language];

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => setCooldownRemaining(prev => Math.max(0, prev - 100)), 100);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);
  
  // Track presence when user joins
  useEffect(() => {
    if (isJoined && nickname) {
      cleanupPresenceRef.current = trackPresence(nickname);
    }
    
    return () => {
      if (cleanupPresenceRef.current) {
        cleanupPresenceRef.current();
      }
    };
  }, [isJoined, nickname, trackPresence]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJOdpYqHfYl+nrK+q5eOhYB6gIyYoZyWjYuLipWfpZ+Yj4aAfH6DiJGUnZuWj4qHhIWJj5SYmpaRjIeEg4WJjpOXmZeUj4qGhIOGiY6TlpiXk4+LhoSDhomOk5aYl5OPi4aEg4aJjpOWmJeTj4uGhIOGiY6TlpiXk4+LhoSDhomOk5aYl5OPi4aEg4aJjpOWl5eTj4uGhIOGiY6TlpeXk4+LhoSDhomOk5aXl5OPi4aEg4aJjpOWl5eTj4uGhIOGiY6TlpeXk4+LhoSDhomNkpWWlpKOioaEg4aJjZKVlpaSjouGhIOFiI2SlZaWko6LhoSDhYiNkpWWlpKOi4aEg4WIjZKVlpaSjouGhIOFiI2SlZWVko6LhoSDhYiNkpWVlZKOi4aEg4WIjZKVlZWSjouGhIOFiI2SlZWVko6LhoSDhYiNkpWVlZKOi4aEg4WIjJGUlZSRjouGhIOFiIyRlJWUkY6LhoSDhYiMkZSVlJGOi4aEg4WIjJGUlJSRjouGhIOFiIyRlJSUkY6LhoSDhYiMkZSUlJGOi4aEg4WIjJGUlJSRjouGhIOFiIyRlJSUkY6LhoSDhIiMkZOUlJGOi4aEg4SIjJGTlJSRjouGhIOEiIyRk5SUkY6LhoSDhIiMkZOUlJGOi4aEg4SIjJGTk5ORjouGhIOEiIyRk5OTkY6LhoSDhIiMkZOTk5GOi4aEg4SIjJGTk5ORjouGhIOEiIyRk5OTkY6LhoSDhIiMkJOTk5GOi4aEg4SHjJCTk5ORjouGhIOEh4yQk5OTkY6LhoSDhIeMkJOTk5GOi4aEg4SHjJCTkpKRjouGhIOEh4yQk5KSkY6LhoSDhIeMkJOSkpGOi4aEg4SHjJCTkpKRjouGhIOEh4yQkpKSkY6LhoSDhIeMkJKSkpGOi4aEg4SHjJCSkpKRjouGhIOEh4yQkpKSkY6LhoSDhIeMkJKSkpCNi4aEg4SHi5CSkpKQjYuGhIOEh4uQkpKSkI2LhoSDhIeLkJKSkpCNi4aEg4SHi5CSkZGQjYuGhIOEh4uQkpGRkI2LhoSDhIeLkJKRkZCNi4aEg4SHi5CSkZGQjYuGhIOEh4uQkZGRkI2LhoSDhIeLkJGRkZCNi4aEg4SHi5CRkZGQjYuGhIOEh4uQkZGRkI2LhoSDg4eLj5GRkZCNi4aEg4OHi4+RkZGQjYuGhIODh4uPkZGRkI2LhoSDg4eLj5GRkJCNi4aEg4OHi4+RkZCQjYuGhIODh4uPkZGQkI2LhoSDg4eLj5GRkJCNi4aEg4OHi4+RkJCQjYuGhIODh4uPkZCQkI2LhoSDg4eLj5GQkJCNi4aEg4OHi4+RkJCQjYuGhIODh4uPkJCQkI2LhoSDg4eLj5CQkJCNi4aEg4OHi4+QkJCQjYuGhIODh4uPkJCQkI2LhoODg4eLj5CQkI+Ni4aDg4OHi4+QkJCPjYuGg4ODh4uPkJCQj42LhoODg4eLj5CQj4+Ni4aDg4OHi4+QkI+PjYuGg4ODh4uPkJCPj42LhoODg4eLj5CQj4+Ni4aDg4OHi4+Qj4+PjYuGg4ODh4uPkI+Pj42LhoODg4eLj5CPj4+Ni4aDg4OHi4+Qj4+PjYuGg4ODh4uOj4+Pj42LhoODg4eLjo+Pj4+Ni4aDg4OHi46Pj4+PjYuGg4ODh4uOj4+Pj42LhoODg4eLjo+Pj4+Ni4aDg4OHi46Pj4+PjYuGg4ODh4uOj4+Pj42LhoODg4eLjo+Pj42Ni4aDg4OGi46Pj4+NjYuGg4ODhouOj4+PjY2LhoODg4aLjo+Pj42Ni4aDg4OGi46Pjo6NjYuGg4ODhouOj46OjY2LhoODg4aLjo+Ojo2Ni4aDg4OGi46Pjo6NjYuGg4ODhouOjo6OjY2LhoODg4aLjo6Ojo2Ni4aDg4OGi46Ojo6NjYuGg4ODhouOjo6OjY2LhoODg4aLjo6OjY2Ni4aDg4OGi42Ojo6NjY2LhoODg4aLjY6Ojo2NjYuGg4ODhouNjo6OjY2Ni4aDg4OGi42Ojo2NjY2LhoODg4aLjY6OjY2NjYuGg4ODhouNjo6NjY2Ni4aDg4OGi42Ojo2NjY2LhoODg4aLjY6NjY2NjYuGg4ODhouNjY2NjY2Ni4aDg4OGi42NjY2NjY2LhoODg4aLjY2NjY2NjYuGg4ODhouNjY2NjY2Ni4aDg4OFi42NjY2NjY2LhoODg4WLjY2NjY2NjYuGg4ODhYuNjY2NjY2Ni4aDg4OFi42NjY2NjY2LhoODg4WLjY2NjY2NjYuGg4ODhYuNjY2NjY2Ni4aDg4OFi42NjY2NjI2LhoODg4WLjI2NjY2MjYuGg4ODhYuMjY2NjYyNi4aDg4OFi4yNjY2NjI2Lg4ODg4WLjI2MjIyMjYuDg4ODhYuMjYyMjIyNi4ODg4OFi4yNjIyMjI2Lg4ODg4WLjIyMjIyMjIuDg4ODhYuMjIyMjIyMi4ODg4OFi4yMjIyMjIyLg4ODg4WLjIyMjIyMjIuDg4ODhYuMjIyMjIyMi4ODg4OFi4yMjIyMjIyLg4ODg4WLjIyMjIyMjIuDg4ODhYuMjIyMjIyMi4ODg4OFi4yMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMi4ODg4OFioyMjIyMjIyLg4ODg4WKjIyMjIyMjIuDg4ODhYqMjIyMjIyMiw==");
  }, []);

  // Play sound on new message
  const playMessageSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

  // Play typing sound
  const playTypeSound = useCallback(() => {
    if (soundEnabled && typeSoundRef.current) {
      typeSoundRef.current.currentTime = 0;
      typeSoundRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);
  // Fetch initial messages
  useEffect(() => {
    if (!isJoined) return;

    const fetchMessages = async () => {
      // Use the public view that hides session_id for privacy
      const { data, error } = await supabase
        .from("chat_messages_public")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        logger.error("Error fetching messages:", error);
        return;
      }

      setMessages(data || []);
      prevMessageCountRef.current = data?.length || 0;
    };

    fetchMessages();
  }, [isJoined]);

  // Real-time subscription
  useEffect(() => {
    if (!isJoined) return;

    const channel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
          
          // Play sound for new messages (not your own)
          if (newMessage.nickname !== nickname) {
            playMessageSound();
          }
          
          // Trigger fire animation if message contains 🔥
          if (newMessage.message.includes("🔥")) {
            setFireAnimations(prev => new Set([...prev, newMessage.id]));
            setTimeout(() => {
              setFireAnimations(prev => {
                const next = new Set(prev);
                next.delete(newMessage.id);
                return next;
              });
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isJoined, nickname, playMessageSound]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Scroll to bottom when joining chat
  useEffect(() => {
    if (isJoined) {
      scrollToBottom();
    }
  }, [isJoined, scrollToBottom]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNickname = nickname.trim().toLowerCase();
    
    // Check protected names
    if (PROTECTED_NAMES.some(name => trimmedNickname.includes(name))) {
      toast({
        title: t.invalidName,
        description: t.nameReserved,
        variant: "destructive",
      });
      return;
    }
    
    if (nickname.trim().length < 2) {
      toast({
        title: t.invalidName,
        description: t.nameTooShort,
        variant: "destructive",
      });
      return;
    }
    if (nickname.trim().length > 20) {
      toast({
        title: t.invalidName,
        description: t.nameTooLong,
        variant: "destructive",
      });
      return;
    }
    setIsJoined(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) return;
    
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTime;
    if (timeSinceLastMessage < RATE_LIMIT_MS) {
      const remaining = RATE_LIMIT_MS - timeSinceLastMessage;
      setCooldownRemaining(remaining);
      toast({
        title: t.waitAMoment,
        description: `${t.sendAgainIn} ${Math.ceil(remaining / 1000)} ${t.seconds}.`,
        variant: "destructive",
      });
      return;
    }
    
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      toast({
        title: t.messageTooLong,
        description: `${t.maxChars} ${MAX_MESSAGE_LENGTH} ${t.charsPerMessage}.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Validate and clean message with comprehensive profanity filter
    const validation = validateAndCleanMessage(trimmedMessage, MAX_MESSAGE_LENGTH);
    
    if (!validation.isValid && validation.reason === 'blocked_content') {
      toast({
        title: t.couldNotSend,
        description: language === 'sv' ? 'Meddelandet innehåller otillåtet innehåll.' : 
                     language === 'es' ? 'El mensaje contiene contenido no permitido.' :
                     'Message contains blocked content.',
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.from("chat_messages").insert({
      nickname: sanitizeMessage(nickname.trim()),
      message: validation.cleanedMessage,
      session_id: sessionId,
    });

    if (error) {
      logger.error("Error sending message:", error);
      toast({
        title: t.couldNotSend,
        description: error.message.includes("banned") ? t.youAreBanned : t.tryAgain,
        variant: "destructive",
      });
    } else {
      setMessage("");
      setLastMessageTime(now);
    }

    setIsLoading(false);
  };

  const handleQuickEmote = async (emote: string) => {
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTime;
    if (timeSinceLastMessage < RATE_LIMIT_MS) {
      const remaining = RATE_LIMIT_MS - timeSinceLastMessage;
      setCooldownRemaining(remaining);
      toast({
        title: t.waitAMoment,
        description: `${t.sendAgainIn} ${Math.ceil(remaining / 1000)} ${t.seconds}.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from("chat_messages").insert({
      nickname: nickname.trim(),
      message: emote,
      session_id: sessionId,
    });

    if (error) {
      logger.error("Error sending emote:", error);
      toast({
        title: t.couldNotSend,
        description: error.message.includes("banned") ? t.youAreBanned : t.tryAgain,
        variant: "destructive",
      });
    } else {
      setLastMessageTime(now);
    }

    setIsLoading(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if message is just an emote
  const isEmoteMessage = (msg: string) => QUICK_EMOTES.includes(msg);

  // Join screen
  if (!isJoined) {
    return (
      <section 
        id="live-chat-section"
        className="py-12 sm:py-16 px-3 sm:px-6"
        aria-labelledby="chat-join-title"
      >
        <div className="max-w-md mx-auto">
          <div className="glass-card-neon p-6 sm:p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full icon-gradient-cyan flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h2 
              id="chat-join-title"
              className="font-display text-2xl sm:text-3xl font-bold text-neon-gradient mb-2"
            >
              {t.liveChat}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t.chatWithListeners}
            </p>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="nickname-input" className="sr-only">
                  {t.nicknameLabel}
                </label>
                <Input
                  id="nickname-input"
                  type="text"
                  placeholder={t.enterNickname}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-background/50 border-muted focus:border-neon-cyan text-center text-lg"
                  maxLength={20}
                  aria-describedby="nickname-help"
                />
                <p id="nickname-help" className="text-xs text-muted-foreground mt-2">
                  {t.nicknameHelp}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-neon-pink to-neon-cyan hover:opacity-90 text-white font-display font-bold tracking-wider"
                aria-label={t.joinChat}
              >
                <Users className="w-4 h-4 mr-2" aria-hidden="true" />
                {t.joinChat}
              </Button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  // Chat interface
  return (
    <section 
      id="live-chat-section"
      className="py-12 sm:py-16 px-3 sm:px-6"
      aria-labelledby="chat-title"
    >
      <div className="max-w-2xl mx-auto">
        <div className="glass-card-neon overflow-hidden">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-border/50 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-neon-cyan rounded-full animate-pulse" aria-hidden="true"></div>
              <h2 
                id="chat-title"
                className="font-display font-bold text-neon-gradient"
              >
                {t.liveChat}
              </h2>
              {/* Listener count */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 border border-muted">
                <Users className="w-3.5 h-3.5 text-neon-cyan" aria-hidden="true" />
                <span className="text-xs font-semibold text-neon-cyan">{listenerCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Sound toggle */}
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-neon-cyan" aria-hidden="true" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                )}
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                  aria-label={t.soundForNewMessages}
                  className="data-[state=checked]:bg-neon-cyan"
                />
              </div>
              <div className="text-sm text-muted-foreground flex items-center">
                <span className="text-neon-pink font-semibold">{nickname}</span>
                <UserBadge nickname={nickname} />
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea 
            className="h-64 sm:h-80 p-3 sm:p-4" 
            ref={scrollRef}
            aria-label={t.chatMessages}
            role="log"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
                <p>{t.noMessagesYet}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isOwn = msg.nickname === nickname;
                  const isEmote = isEmoteMessage(msg.message);
                  const hasFire = fireAnimations.has(msg.id);
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOwn ? "items-end" : "items-start"} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 transition-all duration-300 ${
                          isEmote 
                            ? "bg-transparent text-3xl py-1" 
                            : isOwn
                              ? "chat-bubble-own"
                              : "chat-bubble-other"
                        } ${hasFire ? "fire-glow" : ""}`}
                      >
                        {!isEmote && (
                          <div className="flex items-center gap-1 mb-1">
                            <span
                              className={`text-xs font-semibold ${
                                isOwn ? "text-neon-cyan" : "text-neon-pink"
                              }`}
                            >
                              {msg.nickname}
                            </span>
                            <UserBadge nickname={msg.nickname} />
                            <span className="text-[10px] text-muted-foreground ml-1">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <p className={`${isEmote ? "text-center" : "text-sm"} text-foreground break-words`}>
                          {msg.message}
                          <FireAnimation show={hasFire && msg.message.includes("🔥")} />
                        </p>
                      </div>
                    </div>
                  );
                })}
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Quick Emotes */}
          <div className="px-3 sm:px-4 py-2 border-t border-border/30 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground mr-2">Quick:</span>
            {QUICK_EMOTES.map((emote) => (
              <button
                key={emote}
                onClick={() => handleQuickEmote(emote)}
                disabled={isLoading}
                className="text-xl hover:scale-125 active:scale-95 transition-transform duration-150 disabled:opacity-50 p-1 rounded hover:bg-muted/30"
                aria-label={`${t.send} ${emote}`}
              >
                {emote}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 border-t border-border/30 flex gap-2"
          >
            <label htmlFor="message-input" className="sr-only">
              {t.typeMessage}
            </label>
            <Input
              id="message-input"
              ref={inputRef}
              type="text"
              placeholder={t.typeMessage}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (e.target.value.length > message.length) {
                  playTypeSound();
                }
              }}
              className="flex-1 bg-background/50 border-muted focus:border-neon-cyan"
              maxLength={500}
              disabled={isLoading}
              aria-label={t.typeMessage}
            />
            <Button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="bg-gradient-to-r from-neon-pink to-neon-cyan hover:opacity-90 text-white"
              aria-label={t.send}
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LiveChat;
