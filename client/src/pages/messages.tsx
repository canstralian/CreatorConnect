import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopNavigation from "@/components/navigation/top-navigation";
import MobileNavigation from "@/components/navigation/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { User, Send, ArrowLeft } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";

interface Conversation {
  partner: {
    id: number;
    username: string;
    displayName: string;
    profileImage?: string;
    isVerified: boolean;
    isOnline: boolean;
  };
  lastMessage: {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    isRead: boolean;
    createdAt: string;
  };
  unreadCount: number;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ConversationResponse {
  partner: {
    id: number;
    username: string;
    displayName: string;
    profileImage?: string;
    isVerified: boolean;
    isOnline: boolean;
  };
  messages: Message[];
}

export default function Messages() {
  const params = useParams();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const selectedUserId = params.userId ? parseInt(params.userId) : undefined;

  // Get user conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });

  // Get specific conversation if a user is selected
  const { data: conversation, isLoading: conversationLoading } = useQuery<ConversationResponse>({
    queryKey: [`/api/messages/${selectedUserId}`],
    enabled: !!user && !!selectedUserId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedUserId) {
        throw new Error("Cannot send message - missing user or recipient");
      }
      
      return apiRequest("POST", "/api/messages", {
        receiverId: selectedUserId,
        content: message,
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages]);

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate();
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = (userId: number) => {
    navigate(`/messages/${userId}`);
  };

  // Handle back button on mobile
  const handleBack = () => {
    navigate('/messages');
  };

  // Determine if we should show the conversation list or a specific conversation
  const showConversationList = !selectedUserId || window.innerWidth >= 768;
  const showConversation = !!selectedUserId;

  if (!user) {
    return (
      <>
        <TopNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 mx-auto text-accent mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Login Required</h2>
              <p className="text-accent mb-4">You need to be logged in to view your messages.</p>
              <Button onClick={() => navigate("/login")}>Login</Button>
            </CardContent>
          </Card>
        </div>
        <MobileNavigation />
      </>
    );
  }

  return (
    <>
      <TopNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 sm:pb-6">
        <div className="bg-white dark:bg-background rounded-xl shadow-sm overflow-hidden flex h-[calc(80vh-8rem)]">
          {/* Conversation List (Hidden on mobile when viewing a conversation) */}
          {showConversationList && (
            <div className={`border-r border-border ${showConversation ? 'hidden md:block w-1/3' : 'w-full'}`}>
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Messages</h2>
              </div>
              <ScrollArea className="h-[calc(80vh-8rem-57px)]">
                {conversationsLoading ? (
                  <div className="flex flex-col gap-4 p-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-2"></div>
                          <div className="h-3 w-32 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations && conversations.length > 0 ? (
                  conversations.map((convo) => (
                    <div key={convo.partner.id}>
                      <button
                        className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                          selectedUserId === convo.partner.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleSelectConversation(convo.partner.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <img
                              src={convo.partner.profileImage || "https://i.pravatar.cc/300"}
                              alt={convo.partner.displayName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            {convo.partner.isOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-background rounded-full"></span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1 truncate">
                                <span className="font-medium text-foreground truncate">
                                  {convo.partner.displayName}
                                </span>
                                {convo.partner.isVerified && <VerifiedBadge size="xs" />}
                              </div>
                              <span className="text-xs text-accent">
                                {formatDistanceToNow(new Date(convo.lastMessage.createdAt), {
                                  addSuffix: false,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-sm text-accent truncate max-w-[180px]">
                                {convo.lastMessage.senderId === user.id ? "You: " : ""}
                                {convo.lastMessage.content}
                              </p>
                              {convo.unreadCount > 0 && (
                                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                                  {convo.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                      <Separator />
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-accent">No conversations yet. Start connecting with creators!</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Conversation/Messages View */}
          {showConversation ? (
            <div className={showConversationList ? 'w-2/3' : 'w-full'}>
              {conversationLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : conversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    {!showConversationList && (
                      <Button variant="ghost" size="icon" onClick={handleBack} className="md:hidden">
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    )}
                    <img
                      src={conversation.partner.profileImage || "https://i.pravatar.cc/300"}
                      alt={conversation.partner.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-foreground">{conversation.partner.displayName}</h3>
                        {conversation.partner.isVerified && <VerifiedBadge size="xs" />}
                      </div>
                      <div className="flex items-center text-xs text-accent">
                        <span
                          className={`w-2 h-2 rounded-full mr-1 ${
                            conversation.partner.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        ></span>
                        {conversation.partner.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="h-[calc(80vh-8rem-57px-70px)] p-4">
                    <div className="flex flex-col gap-4">
                      {conversation.messages.map((msg) => {
                        const isSender = msg.senderId === user.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="flex items-end gap-2 max-w-[80%]">
                              {!isSender && (
                                <img
                                  src={conversation.partner.profileImage || "https://i.pravatar.cc/300"}
                                  alt={conversation.partner.displayName}
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                              )}
                              <div
                                className={`px-4 py-2 rounded-lg ${
                                  isSender
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-muted text-foreground rounded-bl-none'
                                }`}
                              >
                                <p>{msg.content}</p>
                                <div
                                  className={`text-xs mt-1 ${
                                    isSender ? 'text-white text-opacity-80' : 'text-accent'
                                  }`}
                                >
                                  {formatDistanceToNow(new Date(msg.createdAt), {
                                    addSuffix: true,
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-3 border-t border-border">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1"
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/80 text-white"
                        disabled={!message.trim() || sendMessageMutation.isPending}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="bg-muted inline-flex p-4 rounded-full mb-4">
                      <Send className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Conversation Selected</h3>
                    <p className="text-accent">
                      Select a conversation from the list or start a new one from a creator's profile.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex w-2/3 h-full items-center justify-center p-6">
              <div className="text-center">
                <div className="bg-muted inline-flex p-4 rounded-full mb-4">
                  <Send className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a Conversation</h3>
                <p className="text-accent">
                  Choose a conversation from the list or start a new one from a creator's profile.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <MobileNavigation />
    </>
  );
}
