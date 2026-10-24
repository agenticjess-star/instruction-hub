import { useMemo, useRef } from "react";
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { Send, Square, Wand2, ArrowUpLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImproveWithAIProps {
  instructionName: string;
  instructionContent: string;
  onUseDraft: (text: string) => void;
}

const ImproveWithAI = ({ instructionName, instructionContent, onUseDraft }: ImproveWithAIProps) => {
  // Keep the latest editor values available to the transport without recreating the runtime.
  const contextRef = useRef({ instructionName, instructionContent });
  contextRef.current = { instructionName, instructionContent };
  const onUseDraftRef = useRef(onUseDraft);
  onUseDraftRef.current = onUseDraft;

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/improve-instruction`,
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          return {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${data.session?.access_token ?? ""}`,
          };
        },
        body: () => ({
          instructionName: contextRef.current.instructionName,
          instructionContent: contextRef.current.instructionContent,
        }),
      }),
    [],
  );

  const runtime = useChatRuntime({
    transport,
    onError: (error) => {
      toast.error(error.message || "The AI request failed. Please try again.");
    },
  });

  const AssistantDraftText = ({ text }: { text: string }) => (
    <div className="border-l-2 border-primary/40 pl-3">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</p>
      <button
        type="button"
        onClick={() => {
          onUseDraftRef.current(text);
          toast.success("Draft inserted into the editor");
        }}
        className="mt-2 inline-flex items-center gap-1.5 border rule px-2.5 py-1 label-mono text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <ArrowUpLeft className="w-3 h-3" /> Use this draft
      </button>
    </div>
  );

  const ChatMessage = () => (
    <MessagePrimitive.Root className="mb-4">
      <MessagePrimitive.If user>
        <div className="ml-auto max-w-[85%] bg-foreground px-3 py-2">
          <div className="text-sm text-background whitespace-pre-wrap">
            <MessagePrimitive.Parts />
          </div>
        </div>
      </MessagePrimitive.If>
      <MessagePrimitive.If assistant>
        <MessagePrimitive.Parts components={{ Text: AssistantDraftText }} />
      </MessagePrimitive.If>
    </MessagePrimitive.Root>
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col bg-background">
        <ThreadPrimitive.Viewport className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          <ThreadPrimitive.Empty>
            <div className="py-10 text-center space-y-3">
              <Wand2 className="w-5 h-5 mx-auto text-primary" />
              <p className="label-mono text-muted-foreground">AI instruction editor</p>
              <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                Describe what this agent should do, or ask me to tighten your draft. I can rewrite it into a
                complete system instruction.
              </p>
            </div>
          </ThreadPrimitive.Empty>
          <ThreadPrimitive.Messages components={{ Message: ChatMessage }} />
          <ThreadPrimitive.If running>
            <p className="label-mono text-muted-foreground px-1 py-2 animate-pulse">Thinking…</p>
          </ThreadPrimitive.If>
        </ThreadPrimitive.Viewport>

        <ComposerPrimitive.Root className="border-t rule p-3 flex items-end gap-2">
          <ComposerPrimitive.Input
            autoFocus
            placeholder="Ask for improvements, or describe the agent…"
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-h-[36px] max-h-[140px]"
          />
          <ThreadPrimitive.If running>
            <ComposerPrimitive.Cancel
              aria-label="Stop generating"
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center border rule text-muted-foreground hover:text-foreground transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
            </ComposerPrimitive.Cancel>
          </ThreadPrimitive.If>
          <ThreadPrimitive.If running={false}>
            <ComposerPrimitive.Send
              aria-label="Send message"
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </ComposerPrimitive.Send>
          </ThreadPrimitive.If>
        </ComposerPrimitive.Root>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
};

export default ImproveWithAI;
