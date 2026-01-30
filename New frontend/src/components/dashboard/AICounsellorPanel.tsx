import { Sparkles, Send, ArrowRight, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useState, useRef, useEffect } from "react";
import { aiCounsellorAPI } from "@/lib/api";
import aiIllustration from "@/assets/ai-counsellor.svg";

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export const AICounsellorPanel = () => {
  const { chatMessages, setChatMessages, loadUserData, loadUniversities } = useApp();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);

        // Automatically send if in voice session
        if (isVoiceEnabled && transcript.trim()) {
          handleSend(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Text to Speech logic
  const speakResponse = (text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    // Stop any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      // Re-activate listening after AI finishes speaking
      if (isVoiceEnabled) {
        setTimeout(() => toggleListening(), 500);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const handleSend = async (overrideInput?: string) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || isTyping) return;

    const userMessage = messageToSend;
    if (!overrideInput) setInput("");

    // Add user message to UI
    const newUserMsg = { id: Date.now().toString(), role: 'user' as const, content: userMessage };
    setChatMessages(prev => [...prev, newUserMsg]);

    setIsTyping(true);
    try {
      const res = await aiCounsellorAPI.chat(userMessage);
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'ai' as const,
        content: res.data.message
      };
      setChatMessages(prev => [...prev, aiResponse]);
      speakResponse(res.data.message);

      // Handle Agentic Actions
      if (res.data.action && res.data.action.type !== 'none') {
        console.log("AI took action:", res.data.action);
        // Refresh the global state to reflect the action (shortlist/lock/task)
        setTimeout(() => {
          loadUserData();
          loadUniversities();
        }, 500);
      }
    } catch (err) {
      console.error("Chat failed", err);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="ai-panel rounded-2xl p-6 relative overflow-hidden h-[650px] flex flex-col"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, hsla(245, 58%, 51%, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, hsla(280, 60%, 55%, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, hsla(245, 58%, 51%, 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </motion.div>
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground">Your AI Counsellor</h3>
            <div className="flex items-center gap-1.5">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-success rounded-full"
              />
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 rounded-lg gap-2 text-xs font-medium transition-all ${isVoiceEnabled ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground'}`}
              onClick={() => {
                setIsVoiceEnabled(!isVoiceEnabled);
                if (isVoiceEnabled) window.speechSynthesis.cancel();
              }}
            >
              {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              Voice Mode
            </Button>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-2" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {chatMessages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="flex flex-col items-center justify-center h-full text-center px-4"
              >
                <motion.img
                  src={aiIllustration}
                  alt="AI Counsellor"
                  className="w-48 h-auto mb-6 drop-shadow-xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <h4 className="text-lg font-semibold text-foreground mb-2">How can I help you today?</h4>
                <p className="text-sm text-muted-foreground max-w-[240px]">
                  Ask me about university matches, application stages, or document checklists.
                </p>
              </motion.div>
            )}
            {chatMessages.map((message, index) => (
              <motion.div
                key={message.id || index}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border/50 text-foreground rounded-bl-md shadow-sm"
                    }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-card border border-border/50 text-foreground rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative mt-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={isListening ? "Listening..." : "Ask your AI counsellor..."}
              className={`pr-12 transition-all ${isListening ? 'border-primary shadow-glow-primary' : ''}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isTyping}
            />
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
            >
              <Button
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              variant={isListening ? "default" : "outline"}
              className={`h-10 w-10 rounded-xl transition-all ${isListening ? 'shadow-glow-primary animate-pulse' : ''}`}
              onClick={toggleListening}
              disabled={isTyping || !recognitionRef.current}
            >
              {isListening ? <Mic className="h-5 w-5" /> : <Mic className="h-5 w-5 opacity-70" />}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
