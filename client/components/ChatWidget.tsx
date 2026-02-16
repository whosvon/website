import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X, User as UserIcon, Clock, Mail } from "lucide-react";
import { ChatMessage, User } from "@shared/api";
import { cn } from "@/lib/utils";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string>("");
  const [showWaitNotice, setShowWaitNotice] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    let currentGuestId = sessionStorage.getItem("guestId");
    if (!currentGuestId) {
      currentGuestId = "guest-" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("guestId", currentGuestId);
    }
    setGuestId(currentGuestId);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, user, guestId]);

  // Monitor wait time
  useEffect(() => {
    if (!isOpen || chatMessages.length === 0) {
      setShowWaitNotice(false);
      return;
    }

    const checkWaitTime = () => {
      const lastMessage = chatMessages[chatMessages.length - 1];
      
      // If the last message is from the customer, they are waiting
      if (lastMessage.senderRole === 'customer') {
        const waitTimeMs = Date.now() - new Date(lastMessage.timestamp).getTime();
        if (waitTimeMs > 60000) { // 1 minute
          setShowWaitNotice(true);
        } else {
          setShowWaitNotice(false);
        }
      } else {
        // Admin has responded
        setShowWaitNotice(false);
      }
    };

    const waitInterval = setInterval(checkWaitTime, 5000);
    checkWaitTime(); // Initial check

    return () => clearInterval(waitInterval);
  }, [isOpen, chatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, showWaitNotice]);

  const fetchMessages = async () => {
    const currentId = user?.id || guestId;
    if (!currentId) return;

    try {
      const url = `/api/chat?userId=${currentId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const currentId = user?.id || guestId;
    const newMessage = {
      senderId: currentId,
      senderName: user?.name || "Guest",
      senderRole: user?.role || 'customer',
      text: message
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      if (res.ok) {
        setMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <Card className="w-80 h-96 mb-4 flex flex-col shadow-2xl border-primary/20 bg-card/95 backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <CardHeader className="p-4 border-b bg-primary/5 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Support
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {chatMessages.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">How can we help you today?</p>
              </div>
            ) : (
              <>
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.senderRole === 'admin' ? "items-start" : "items-end ml-auto"
                  )}>
                    <div className={cn(
                      "px-3 py-2 rounded-2xl text-xs",
                      msg.senderRole === 'admin' 
                        ? "bg-muted text-foreground rounded-tl-none" 
                        : "bg-primary text-primary-foreground rounded-tr-none"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {msg.senderRole === 'admin' ? "Support" : "You"} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                
                {showWaitNotice && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase italic">System Notice</span>
                      </div>
                      <p className="text-[10px] font-medium leading-relaxed">
                        We're currently experiencing high volume. Please leave your <span className="font-bold">email</span> and <span className="font-bold">issue</span> below—it may take us a while to get back to you. Sorry! :)
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="p-3 border-t bg-muted/30">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input 
                placeholder="Type a message..." 
                className="h-9 text-xs bg-background/50 border-none rounded-full" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button type="submit" size="icon" className="h-9 w-9 rounded-full flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
      
      <Button 
        onClick={() => setIsOpen(!isOpen)} 
        size="icon" 
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all active:scale-95",
          isOpen ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}