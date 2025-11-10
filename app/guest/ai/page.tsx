"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGuestAI } from "@/hooks/useGuestAI";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  MessageSquare,
  Send,
  RefreshCw,
  BookOpen,
  HelpCircle,
  Sparkles
} from "lucide-react";

export default function GuestAIPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { loading: aiLoading, ragQuery, checkHealth } = useGuestAI();

  const [query, setQuery] = useState("");
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [systemHealth, setSystemHealth] = useState<{
    status: string;
    timestamp: string;
    uptime: string;
  } | null>(null);

  useEffect(() => {
    console.log('🤖 GuestAIPage: Loading AI system health');
    checkHealth().then(setSystemHealth).catch(console.error);
  }, [checkHealth]);

  const handleQuery = async () => {
    if (!query.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: query,
      timestamp: new Date()
    };

    // Add user message to conversation
    setConversation(prev => [...prev, userMessage]);

    try {
      console.log('🤖 GuestAIPage: Sending query to AI:', query);
      const response = await ragQuery({
        query: query,
        max_documents: 5
      });

      const aiMessage = {
        role: 'assistant' as const,
        content: response.answer,
        timestamp: new Date()
      };

      // Add AI response to conversation
      setConversation(prev => [...prev, aiMessage]);
      setQuery("");
    } catch (error) {
      console.error('❌ GuestAIPage: AI query failed:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: "Sorry, I couldn't process your question right now. Please try again later.",
        timestamp: new Date()
      };
      setConversation(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  // Allow access for guests (no authentication required for basic AI queries)
  const canAccess = !authLoading;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={user || undefined} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">AI Course Assistant</h1>
                    <p className="text-muted-foreground">
                      Ask questions about our courses and get instant answers
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={clearConversation}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Clear Chat
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/guest/courses')}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Courses
                    </Button>
                  </div>
                </div>

                {/* System Health */}
                {systemHealth && (
                  <Card className="mt-6">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            systemHealth.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="font-medium">AI System Status</p>
                            <p className="text-sm text-muted-foreground">
                              {systemHealth.status === 'ok' ? 'Online' : 'Offline'} • Uptime: {systemHealth.uptime}
                            </p>
                          </div>
                        </div>
                        <Badge variant={systemHealth.status === 'ok' ? 'default' : 'destructive'}>
                          {systemHealth.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Chat Interface */}
                <div className="grid gap-6 mt-6 md:grid-cols-3">
                  {/* Chat Area */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Conversation
                      </CardTitle>
                      <CardDescription>
                        Chat with our AI assistant about courses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Messages */}
                      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                        {conversation.length === 0 ? (
                          <div className="text-center py-8">
                            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                            <p className="text-muted-foreground">
                              Ask me anything about our courses, pricing, or curriculum.
                            </p>
                          </div>
                        ) : (
                          conversation.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Input Area */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ask about courses, pricing, curriculum..."
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={aiLoading}
                        />
                        <Button onClick={handleQuery} disabled={aiLoading || !query.trim()}>
                          {aiLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Help & Examples */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        Help & Examples
                      </CardTitle>
                      <CardDescription>
                        Sample questions to try
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Try asking:</p>
                        <div className="space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-2"
                            onClick={() => setQuery("What courses do you offer?")}
                          >
                            <MessageSquare className="h-3 w-3 mr-2" />
                            <span className="text-xs">What courses do you offer?</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-2"
                            onClick={() => setQuery("How much do the courses cost?")}
                          >
                            <MessageSquare className="h-3 w-3 mr-2" />
                            <span className="text-xs">How much do the courses cost?</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-2"
                            onClick={() => setQuery("What programming languages do you teach?")}
                          >
                            <MessageSquare className="h-3 w-3 mr-2" />
                            <span className="text-xs">What programming languages do you teach?</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-2"
                            onClick={() => setQuery("Do you offer certificates?")}
                          >
                            <MessageSquare className="h-3 w-3 mr-2" />
                            <span className="text-xs">Do you offer certificates?</span>
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Sparkles className="h-4 w-4" />
                          <span>Powered by RAG AI</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Call to Action */}
                <Card className="mt-6 bg-gradient-to-r from-primary/10 to-primary/5">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Ready to start learning?</h3>
                      <p className="text-muted-foreground mb-4">
                        Create a free account to access all courses and features.
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => router.push('/login')}>
                          Create Account
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/guest/courses')}>
                          Browse Courses
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}