import { useEffect, useState } from "react";
import { Copy, Check, Send, KeyRound, Bot } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings, useSaveSettings, useConnectTelegram, useDisconnectTelegram } from "@/hooks/useSettings";
import { MCP_URL } from "@/lib/agentGuide";

const Section = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: any;
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <section className="border border-border p-6 mb-6">
    <div className="flex items-center gap-2.5 mb-1.5">
      <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
      <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed mb-5 max-w-[560px]">{description}</p>
    {children}
  </section>
);

const Settings = () => {
  const { data: settings } = useSettings();
  const save = useSaveSettings();
  const connect = useConnectTelegram();
  const disconnect = useDisconnectTelegram();

  const [geminiKey, setGeminiKey] = useState("");
  const [botToken, setBotToken] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (settings?.gemini_api_key) setGeminiKey(settings.gemini_api_key);
  }, [settings?.gemini_api_key]);

  const botConnected = !!settings?.telegram_bot_username;

  return (
    <AppLayout>
      <div className="max-w-[820px] mx-auto px-5 py-12">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground mb-10">Keys, inbox, and integrations</p>

        <Section
          icon={Send}
          title="Telegram inbox"
          description="Create a bot with @BotFather on Telegram, paste its token here, then use your phone's share sheet to send any chat link — the full thread gets extracted and filed automatically. Links to GitHub, X or anywhere else get extracted and sorted too."
        >
          {botConnected ? (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs font-mono text-foreground">@{settings?.telegram_bot_username}</span>
              </div>
              {!settings?.telegram_chat_id && (
                <span className="text-[11px] text-muted-foreground">
                  Send your bot any message to finish linking.
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  disconnect.mutate(undefined, {
                    onSuccess: () => toast.success("Bot disconnected"),
                    onError: (e: any) => toast.error(e.message),
                  })
                }
                className="h-8 text-[11px] text-muted-foreground hover:text-destructive"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Input
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456789:AA..."
                className="rounded-none max-w-[380px] font-mono text-xs"
              />
              <Button
                disabled={connect.isPending || !botToken.trim()}
                onClick={() =>
                  connect.mutate(botToken.trim(), {
                    onSuccess: (d: any) => {
                      setBotToken("");
                      toast.success(`Connected @${d?.username ?? "bot"} — send it a message to finish linking.`);
                    },
                    onError: (e: any) => toast.error(e.message),
                  })
                }
                className="h-10 rounded-none bg-foreground text-background hover:bg-foreground/90 text-[13px]"
              >
                {connect.isPending ? "Connecting…" : "Connect bot"}
              </Button>
            </div>
          )}
        </Section>

        <Section
          icon={KeyRound}
          title="Your own AI key"
          description="Optional. Add a Google Gemini key and cleaning, sorting and optimization run on your key instead of the shared one."
        >
          <div className="flex flex-wrap gap-2">
            <Input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIza..."
              className="rounded-none max-w-[380px] font-mono text-xs"
            />
            <Button
              disabled={save.isPending}
              onClick={() =>
                save.mutate(
                  { gemini_api_key: geminiKey.trim() || null },
                  { onSuccess: () => toast.success("Key saved"), onError: (e: any) => toast.error(e.message) },
                )
              }
              className="h-10 rounded-none bg-foreground text-background hover:bg-foreground/90 text-[13px]"
            >
              Save
            </Button>
          </div>
        </Section>

        <Section
          icon={Bot}
          title="Agent connection"
          description="Add this address as a custom connector in ChatGPT, Claude, Cursor or any MCP client to let your assistants read your instructions and save threads."
        >
          <button
            onClick={() => {
              navigator.clipboard.writeText(MCP_URL);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="w-full flex items-center justify-between gap-3 border border-border px-4 py-3 hover:border-foreground/60 transition-colors text-left"
          >
            <code className="text-[11px] font-mono text-foreground break-all">{MCP_URL}</code>
            {copied ? <Check className="w-4 h-4 text-primary shrink-0" /> : <Copy className="w-4 h-4 text-muted-foreground shrink-0" />}
          </button>
        </Section>
      </div>
    </AppLayout>
  );
};

export default Settings;
