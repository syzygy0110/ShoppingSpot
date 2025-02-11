import { useQuery } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatWindow } from "@/components/chat/chat-window";
import { useState } from "react";

export default function Messages() {
  const [selectedMerchant, setSelectedMerchant] = useState<number | null>(null);
  
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages/1"], // TODO: Get user ID from auth
  });

  // Get unique merchant IDs from messages
  const merchantIds = messages 
    ? [...new Set(messages.map(m => 
        m.fromId === 1 ? m.toId : m.fromId
      ))]
    : [];

  const getLastMessage = (merchantId: number) => {
    if (!messages) return null;
    return messages
      .filter(m => m.fromId === merchantId || m.toId === merchantId)
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {merchantIds.map((merchantId) => {
                  const lastMessage = getLastMessage(merchantId);
                  if (!lastMessage) return null;

                  return (
                    <button
                      key={merchantId}
                      className={`w-full p-4 text-left border-b hover:bg-accent transition-colors ${
                        selectedMerchant === merchantId ? "bg-accent" : ""
                      }`}
                      onClick={() => setSelectedMerchant(merchantId)}
                    >
                      <div className="font-medium">Merchant #{merchantId}</div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {lastMessage.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(lastMessage.timestamp).toLocaleString()}
                      </p>
                    </button>
                  );
                })}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedMerchant ? (
            <ChatWindow userId={1} merchantId={selectedMerchant} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Select a conversation to start messaging
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
