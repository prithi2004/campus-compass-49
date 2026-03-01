import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Trash2, UserPlus, ShieldCheck, UserCog } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const InviteManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("staff");

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createInvite = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("invitations")
        .insert({ email, role })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const link = `${window.location.origin}/signup?token=${data.token}`;
      navigator.clipboard.writeText(link);
      toast({ title: "Invite created!", description: "Invite link copied to clipboard." });
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create invite", description: error.message, variant: "destructive" });
    },
  });

  const deleteInvite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invitations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Invitation deleted" });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/signup?token=${token}`);
    toast({ title: "Link copied to clipboard" });
  };

  const getStatus = (inv: any) => {
    if (inv.used_at) return { label: "Used", variant: "secondary" as const };
    if (new Date(inv.expires_at) < new Date()) return { label: "Expired", variant: "destructive" as const };
    return { label: "Pending", variant: "default" as const };
  };

  return (
    <DashboardLayout role="admin" title="Invite Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-card-foreground">Invite Management</h1>
          <p className="text-muted-foreground">Create invite links for staff and admin accounts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Create New Invitation
            </CardTitle>
            <CardDescription>
              Send an invite link to allow someone to sign up with a specific role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="staff@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="w-40">
                <label className="text-sm font-medium mb-1.5 block">Role</label>
                <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">
                      <span className="flex items-center gap-2"><UserCog className="w-4 h-4" /> Staff</span>
                    </SelectItem>
                    <SelectItem value="admin">
                      <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Admin</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => createInvite.mutate()}
                disabled={!email || createInvite.isPending}
              >
                <Plus className="w-4 h-4 mr-1" />
                {createInvite.isPending ? "Creating..." : "Create Invite"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invitation History</CardTitle>
            <CardDescription>{invitations.length} invitations created</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No invitations yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => {
                    const status = getStatus(inv);
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.email}</TableCell>
                        <TableCell>
                          <Badge variant={inv.role === "admin" ? "destructive" : "default"}>
                            {inv.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {!inv.used_at && new Date(inv.expires_at) > new Date() && (
                            <Button size="icon" variant="ghost" onClick={() => copyLink(inv.token)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteInvite.mutate(inv.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InviteManagement;
