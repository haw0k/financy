'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/lib/shadcn';
import { useRole } from '@/hooks';
import { ERole, EProfileStatus } from '@/enums';
import { routes } from '@/config';
import { showError, showSuccess } from '@/components/ui/ToastNotification';

interface IPendingUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { role, status, isLoading: isRoleLoading } = useRole();
  const [users, setUsers] = useState<IPendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let isCancelled = false;

    const loadUsers = async () => {
      const res = await fetch('/api/admin/pending-users');
      if (isCancelled) return;
      if (!res.ok) {
        showError('Admin', 'Failed to fetch pending users');
        if (!isCancelled) setIsLoading(false);
        return;
      }
      const { data } = await res.json();
      if (!isCancelled) {
        setUsers(data ?? []);
        setIsLoading(false);
      }
    };

    if (!isRoleLoading && role === ERole.Admin && status === EProfileStatus.Approved) {
      loadUsers();
    } else if (!isRoleLoading) {
      setIsLoading(false);
    }

    return () => {
      isCancelled = true;
    };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isRoleLoading, role, status]);

  const handleApprove = async (userId: string) => {
    setProcessingIds((prev) => new Set(prev).add(userId));
    try {
      const res = await fetch('/api/admin/pending-users/approve', {
        method: 'POST',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showSuccess('Admin', 'User approved');
    } catch (err: unknown) {
      showError('Admin', err instanceof Error ? err.message : 'Failed to approve user');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleReject = async (userId: string) => {
    setProcessingIds((prev) => new Set(prev).add(userId));
    try {
      const res = await fetch('/api/admin/pending-users/reject', {
        method: 'POST',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showSuccess('Admin', 'User rejected');
    } catch (err: unknown) {
      showError('Admin', err instanceof Error ? err.message : 'Failed to reject user');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isRoleLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!isRoleLoading && (role !== ERole.Admin || status !== EProfileStatus.Approved)) {
    router.replace(routes.dashboard);
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage pending user registrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Users</CardTitle>
          <CardDescription>Approve or reject new user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <Empty>
              <EmptyContent>
                <EmptyTitle>No pending registrations</EmptyTitle>
                <EmptyDescription>All new user registrations have been processed.</EmptyDescription>
              </EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Signup Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === ERole.Receiver ? 'secondary' : 'default'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={processingIds.has(user.id)}
                          onClick={() => handleApprove(user.id)}
                        >
                          {processingIds.has(user.id) ? <Spinner className="size-3" /> : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={processingIds.has(user.id)}
                          onClick={() => handleReject(user.id)}
                        >
                          {processingIds.has(user.id) ? <Spinner className="size-3" /> : 'Reject'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
