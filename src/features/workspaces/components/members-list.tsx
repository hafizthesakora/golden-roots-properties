'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '../hooks/use-workspace-id';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, MoreVerticalIcon, UserPlusIcon, Loader } from 'lucide-react';
import Link from 'next/link';
import { DottedSeparator } from '@/components/dotted-separator';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { Fragment } from 'react';
import { MemberAvatar } from '@/features/members/components/members-avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteMember } from '@/features/members/api/use-delete-member';
import { useUpdateMember } from '@/features/members/api/use-update-member';
import { MemberRole } from '@/features/members/types';
import { useConfirm } from '@/hooks/use-confirm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ResponsiveModal } from '@/components/responsive-modal';
import { useCurrent } from '@/features/auth/api/use-current';
import type { Member } from '@/features/members/types';

export const MembersList = () => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [ConfirmDialog, confirm] = useConfirm(
    'Remove member',
    'This member will be removed from the workspace',
    'destructive'
  );

  const { data: currentUser } = useCurrent();
  const { data } = useGetMembers({ workspaceId });
  const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();

  useEffect(() => {
    if (!currentUser || !data) return;
    const me = (data.documents as Member[]).find((m) => m.userId === currentUser.$id);
    setIsAdmin(me?.role === MemberRole.ADMIN);
  }, [currentUser, data]);

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({ json: { role }, param: { memberId } });
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;
    deleteMember({ param: { memberId } }, { onSuccess: () => { window.location.reload(); } });
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <ConfirmDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/workspaces/${workspaceId}`}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Members List</CardTitle>
        {isAdmin && (
          <Button
            size="sm"
            className="ml-auto bg-green-700 hover:bg-green-800 text-white"
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlusIcon className="size-4 mr-2" />
            Create Account
          </Button>
        )}
      </CardHeader>
      <div className="px-7"><DottedSeparator /></div>
      <CardContent className="p-7">
        {data?.documents.map((member, index) => (
          <Fragment key={member.$id}>
            <div className="flex items-center gap-2">
              <MemberAvatar className="size-10" fallbackClassName="text-lg" name={member.name ?? ''} />
              <div className="flex flex-col">
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="ml-auto" variant="secondary" size="icon">
                    <MoreVerticalIcon className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuItem className="font-medium" onClick={() => handleUpdateMember(member.$id, MemberRole.ADMIN)} disabled={isUpdatingMember}>
                    Set as Administrator
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-medium" onClick={() => handleUpdateMember(member.$id, MemberRole.MEMBER)} disabled={isUpdatingMember}>
                    Set as Member
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-medium text-amber-700" onClick={() => handleDeleteMember(member.$id)} disabled={isDeletingMember}>
                    Remove {member.name}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {index < data.documents.length - 1 && <Separator className="my-2.5" />}
          </Fragment>
        ))}
      </CardContent>

      <ResponsiveModal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <CreateAccountForm
          workspaceId={workspaceId}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </ResponsiveModal>
    </Card>
  );
};

function CreateAccountForm({ workspaceId, onSuccess, onCancel }: {
  workspaceId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<MemberRole>(MemberRole.MEMBER);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setIsPending(true);
    try {
      const res = await fetch('/api/members/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, name, email, password, role }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? 'Failed to create account'); return; }
      toast.success(`Account created for ${name}`);
      onSuccess();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="p-6 pb-3">
        <CardTitle className="text-lg font-bold">Create Account</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Create a login for a new team member. Share their email and password with them directly.</p>
      </CardHeader>
      <DottedSeparator className="mx-6" />
      <CardContent className="p-6 pt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-1.5">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maria Santos" disabled={isPending} required />
          </div>
          <div className="flex flex-col gap-y-1.5">
            <Label>Email Address</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria@example.com" disabled={isPending} required />
          </div>
          <div className="flex flex-col gap-y-1.5">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" disabled={isPending} required minLength={6} />
            <p className="text-xs text-muted-foreground">Share this password with the team member so they can log in.</p>
          </div>
          <div className="flex flex-col gap-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as MemberRole)} disabled={isPending}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={MemberRole.MEMBER}>Member — standard access</SelectItem>
                <SelectItem value={MemberRole.ADMIN}>Admin — full access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DottedSeparator className="my-1" />
          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isPending} className="flex-1 bg-green-700 hover:bg-green-800 text-white">
              {isPending ? <><Loader className="size-4 mr-2 animate-spin" />Creating...</> : 'Create Account'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
