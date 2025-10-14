'use client';

import * as React from 'react';
import { ChatMessage } from '@/components/advisor/ChatMessage';
import { ChatInput } from '@/components/advisor/ChatInput';
import { NewClientButton } from '@/components/advisor/NewClientButton';
import { NewSessionDialog } from '@/components/advisor/NewSessionDialog';
import { ProjectionChart } from '@/components/custom/ProjectionChart';
import { TaxBreakdownChart } from '@/components/custom/TaxBreakdownChart';
import { StatCard } from '@/components/custom/StatCard';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet,
  TrendingUp,
  Calculator,
  PiggyBank,
  Percent,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import type { ConversationMessage, UserProfile } from '@/types/aiAdvisor';
import type { ProjectionYear, PlannerState } from '@/types';
import { generateFullProjection } from '@/lib/calculations/projections';

/**
 * Convert UserProfile to PlannerState for projection calculations
 */
function userProfileToPlannerState(profile: Partial<UserProfile>): PlannerState | null {
  // Check if we have minimum required data
  if (!profile.current_age || !profile.retirement_age || !profile.gross_annual_income) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return {
    currentAge: profile.current_age,
    retirementAge: profile.retirement_age,
    lifeExpectancy: profile.life_expectancy || 90,
    startingBalance: profile.current_savings || 0,
    monthlyContribution: profile.monthly_ra_contribution || 0,
    annualReturn: 7, // Default assumption
    inflationRate: 5, // Default South African inflation
    drawdownRate: 4, // Default 4% rule
    currentYear,
  };
}

/**
 * AI Financial Advisor Page
 *
 * Split-screen interface:
 * - Left: Chat with AI advisor (Thando Nkosi, CFP®)
 * - Right: Live retirement plan preview
 */
export default function AIAdvisorPage() {
  const [messages, setMessages] = React.useState<ConversationMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Hi! I'm Thando Nkosi, a Certified Financial Planner (CFP®) specializing in retirement planning for South Africans. 🇿🇦

I'm here to help you build a comprehensive retirement plan that's optimized for your situation.

I'll ask you some questions about your finances, goals, and plans. Don't worry - we'll take it step by step, and you can skip anything you're not comfortable sharing.

Let's start with the basics: What's your name, and how old are you?`,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [projectionData, setProjectionData] = React.useState<ProjectionYear[]>([]);
  const [userProfile, setUserProfile] = React.useState<Partial<UserProfile>>({});
  const [showNewSessionDialog, setShowNewSessionDialog] = React.useState(false);
  const [isCreatingSession, setIsCreatingSession] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize session on mount - load existing or create new
  React.useEffect(() => {
    const initSession = async () => {
      try {
        // Use a consistent demo user UUID (in production, this would come from authentication)
        const userId = '00000000-0000-0000-0000-000000000001'; // Demo user UUID

        // Try to load existing active session
        const response = await fetch(`/api/advisor/chat?userId=${userId}`);

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data.session) {
            // Load existing session
            setSessionId(result.data.session.id);

            // Load message history
            if (result.data.messages && result.data.messages.length > 0) {
              const loadedMessages = result.data.messages.map((msg: any) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.timestamp),
              }));
              setMessages(loadedMessages);
              console.log('[Advisor] Loaded', loadedMessages.length, 'messages from session');
            }

            // Load user profile and generate projections
            if (result.data.session.userProfile && Object.keys(result.data.session.userProfile).length > 0) {
              const profile = result.data.session.userProfile;
              setUserProfile(profile);
              console.log('[Advisor] Loaded user profile:', profile);

              // Try to generate projections if we have enough data
              const plannerState = userProfileToPlannerState(profile);
              if (plannerState) {
                try {
                  const projections = generateFullProjection(plannerState);
                  setProjectionData(projections);
                  console.log('[Advisor] Generated', projections.length, 'projection years on session load');
                } catch (error) {
                  console.error('[Advisor] Failed to generate projections:', error);
                }
              } else {
                console.log('[Advisor] Not enough profile data yet for projections');
              }
            }
          }
        }

        // Note: If no active session exists, a new one will be created on first message
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };

    initSession();
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message to UI
    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the AI advisor API
      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId: sessionId,
          userId: '00000000-0000-0000-0000-000000000001', // Demo user UUID
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }

      // Store session ID for future messages
      if (result.data.sessionId && !sessionId) {
        setSessionId(result.data.sessionId);
        console.log('[Advisor] Session ID stored:', result.data.sessionId);
      }

      // Add AI response to UI
      const aiResponse: ConversationMessage = {
        id: result.data.message.id,
        role: 'assistant',
        content: result.data.message.content,
        timestamp: new Date(result.data.message.timestamp),
      };

      setMessages((prev) => [...prev, aiResponse]);

      // Update user profile and generate projections if profile data is available
      if (result.data.user_profile && Object.keys(result.data.user_profile).length > 0) {
        const newProfile = result.data.user_profile;
        setUserProfile(newProfile);
        console.log('[Advisor] Profile updated:', newProfile);

        // Try to generate projections if we have enough data
        const plannerState = userProfileToPlannerState(newProfile);
        if (plannerState) {
          try {
            const projections = generateFullProjection(plannerState);
            setProjectionData(projections);
            console.log('[Advisor] Generated', projections.length, 'projection years');
          } catch (error) {
            console.error('[Advisor] Failed to generate projections:', error);
          }
        } else {
          console.log('[Advisor] Not enough profile data yet for projections');
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);

      const errorMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        role: 'system',
        content: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = async () => {
    setIsCreatingSession(true);

    try {
      const userId = '00000000-0000-0000-0000-000000000001'; // Demo user UUID

      // Call API to create new session
      const response = await fetch('/api/advisor/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          currentSessionId: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }

      // Reset all state
      setSessionId(result.data.sessionId);
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Hi! I'm Thando Nkosi, a Certified Financial Planner (CFP®) specializing in retirement planning for South Africans. 🇿🇦

I'm here to help you build a comprehensive retirement plan that's optimized for your situation.

I'll ask you some questions about your finances, goals, and plans. Don't worry - we'll take it step by step, and you can skip anything you're not comfortable sharing.

Let's start with the basics: What's your name, and how old are you?`,
          timestamp: new Date(),
        },
      ]);
      setUserProfile({});
      setProjectionData([]);

      console.log('[Advisor] New session created:', result.data.sessionId);

      // Close dialog
      setShowNewSessionDialog(false);
    } catch (error) {
      console.error('Failed to create new session:', error);
      alert(`Failed to start new session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Financial Advisor</h1>
            <p className="text-sm text-muted-foreground">
              Powered by GPT-5 | CFP®-level expertise | South African regulations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NewClientButton
              onClick={() => setShowNewSessionDialog(true)}
              disabled={isCreatingSession || isLoading}
            />
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-1.5 text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: Split Screen */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Chat */}
        <div className="flex w-1/2 flex-col border-r">
          {/* Chat Header */}
          <div className="border-b bg-muted/30 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Chat with Thando</h2>
                <p className="text-xs text-muted-foreground">
                  45-question discovery framework • Phase 1/10
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t bg-card px-6 py-4">
            <ChatInput
              onSend={handleSendMessage}
              disabled={isLoading}
              placeholder="Type your response... (Press Enter to send, Shift+Enter for new line)"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              💡 Your information is secure and used only for financial planning advice
            </p>
          </div>
        </div>

        {/* Right Panel: Live Plan Preview */}
        <div className="flex w-1/2 flex-col overflow-y-auto">
          <div className="p-6">
            {/* Preview Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Live Plan Preview</h2>
                <p className="text-xs text-muted-foreground">
                  Updates in real-time as you answer questions
                </p>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projections">Projections</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {projectionData.length === 0 ? (
                  /* Placeholder - will show real data once questions are answered */
                  <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
                    <Calculator className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Start Chatting to See Your Plan</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      As you answer Thando's questions, your personalized retirement projection will
                      appear here with detailed charts and recommendations.
                    </p>
                  </div>
                ) : (
                  /* Show projection chart when data is available */
                  <div className="space-y-4">
                    <ProjectionChart data={projectionData} />
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {(() => {
                    const retirementYearData = projectionData.find(
                      (year) => year.age === (userProfile.retirement_age || 65)
                    );
                    const finalYearData = projectionData[projectionData.length - 1];
                    const totalTaxPaid = projectionData.reduce((sum, year) => sum + year.taxPaid, 0);

                    return (
                      <>
                        <StatCard
                          title="Projected Balance"
                          value={
                            retirementYearData
                              ? `R ${Math.round(retirementYearData.endingBalance).toLocaleString()}`
                              : 'R 0'
                          }
                          icon={Wallet}
                          variant="default"
                          delay={0}
                        />
                        <StatCard
                          title={`Monthly at ${userProfile.retirement_age || 65}`}
                          value={
                            retirementYearData
                              ? `R ${Math.round((retirementYearData.endingBalance * 0.04) / 12).toLocaleString()}`
                              : 'R 0'
                          }
                          icon={PiggyBank}
                          variant="info"
                          delay={100}
                        />
                        <StatCard
                          title="Total Tax Paid"
                          value={`R ${Math.round(totalTaxPaid).toLocaleString()}`}
                          icon={Calculator}
                          variant="warning"
                          delay={200}
                        />
                        <StatCard
                          title="Final Balance"
                          value={
                            finalYearData
                              ? `R ${Math.round(finalYearData.endingBalance).toLocaleString()}`
                              : 'R 0'
                          }
                          icon={TrendingUp}
                          variant="success"
                          delay={300}
                        />
                      </>
                    );
                  })()}
                </div>
              </TabsContent>

              {/* Projections Tab */}
              <TabsContent value="projections" className="space-y-6 mt-6">
                {projectionData.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Year-by-year projections will appear once we have your basic information
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <ProjectionChart data={projectionData} />
                    <TaxBreakdownChart data={projectionData} />
                  </div>
                )}
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-6 mt-6">
                <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
                  <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Personalized recommendations will appear as you complete the discovery process
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* New Session Dialog */}
      <NewSessionDialog
        open={showNewSessionDialog}
        onOpenChange={setShowNewSessionDialog}
        onConfirm={handleNewSession}
        isLoading={isCreatingSession}
      />
    </div>
  );
}
