import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AgentRule } from "@/types";
import { Plus } from "lucide-react";

export default function SettingsPage() {
  const agentMode = useAppStore((state) => state.agentMode);
  const setAgentMode = useAppStore((state) => state.setAgentMode);
  const rules = useAppStore((state) => state.rules);

  const handleModeChange = (checked: boolean) => {
    const newMode = checked ? "autonomous" : "supervised";
    setAgentMode(newMode);
    toast.success(`Agent mode set to ${newMode}`, {
      description: checked 
        ? "Agents will automatically apply remediations" 
        : "Agents will suggest actions for approval"
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">
        Configure IngestMate behavior and agent settings
      </p>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="agents">Agent Rules</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Mode</CardTitle>
              <CardDescription>
                Configure how agents operate across the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="agent-mode">Autonomous Mode</Label>
                <Switch
                  id="agent-mode"
                  checked={agentMode === "autonomous"}
                  onCheckedChange={handleModeChange}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {agentMode === "autonomous"
                  ? "Agents will automatically apply remediations without human approval."
                  : "Agents will suggest remediations for human approval."}
              </p>
              {agentMode === "autonomous" && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-md text-sm">
                  <strong>Warning:</strong> In autonomous mode, agents will automatically apply
                  remediations without human approval. Use with caution.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="slack-notifications">Slack Notifications</Label>
                <Switch id="slack-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="critical-alerts">Critical Alerts Only</Label>
                <Switch id="critical-alerts" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4 mt-6">
          <div className="mb-4 flex justify-end">
            <Button variant="default" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Rule
            </Button>
          </div>
          <AgentRulesList rules={rules} />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
              <CardDescription>
                Connect IngestMate to your data infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Airflow</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect to your Airflow instance
                    </p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                <Separator />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Snowflake</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect to your Snowflake warehouse
                    </p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                <Separator />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">dbt</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect to your dbt project
                    </p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                <Separator />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Slack</h3>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to Slack
                    </p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface AgentRulesListProps {
  rules: AgentRule[];
}

function AgentRulesList({ rules }: AgentRulesListProps) {
  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <Card key={rule.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{rule.name}</CardTitle>
              <Switch defaultChecked={rule.enabled} />
            </div>
            <CardDescription>{rule.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-4 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1">Agent Type</p>
                <p className="capitalize">{rule.agentType}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Requires Approval</p>
                <p>{rule.requiresApproval ? "Yes" : "No"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1">Trigger Condition</p>
              <code className="px-2 py-1 bg-muted rounded text-xs">
                {rule.triggerCondition}
              </code>
            </div>
            <div>
              <p className="text-xs font-medium mb-1">Action</p>
              <p className="text-sm">{rule.action}</p>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button variant="outline" size="sm" className="ml-auto">
              Edit Rule
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
