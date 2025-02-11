import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { Message } from "@shared/schema";

interface ChatWindowProps {
  userId: number;
  merchantId: number;
}

export function ChatWindow({ userId, merchantId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef<WebSocket>();
  
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "auth", userId }));
    };
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };
    
    socketRef.current = socket;
    return () => socket.close();
  }, [userId]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const messageData = {
      type: "message",
      data: {
        fromId: userId,
        toId: merchantId,
        content: message,
      },
    };
    
    socketRef.current?.send(JSON.stringify(messageData));
    setMessage("");
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <ScrollArea className="flex-1 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 ${
              msg.fromId === userId ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                msg.fromId === userId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.content}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </ScrollArea>
      
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
