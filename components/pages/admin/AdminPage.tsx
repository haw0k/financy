'use client';

import { useState, useEffect, useTransition } from 'react';
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
import { useRoleContext } from '@/components/providers';
import { ERole, EProfileStatus } from '@/enums';
import { routes } from '@/config';
import { showError, showSuccess } from '@/components/ui/ToastNotification';
import { getPendingUsersAction, approveUserAction, rejectUserAction } from '@/app/actions/admin';
import { withTimeout } from '@/lib/with-timeout';

interface IPendingUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export function AdminPage() {
  const router = useRouter();
  const { role, status, isLoaded } = useRoleContext();
  const [users, setUsers] = useState<IPendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let isCancelled = false;

    const loadUsers = async () => {
      const result = await getPendingUsersAction();
      if (isCancelled) return;
      if (!result.isSuccess) {
        showError('Admin', result.error);
        if (!isCancelled) setIsLoading(false);
        return;
      }
      if (!isCancelled) {
        setUsers(result.data ?? []);
        setIsLoading(false);
      }
    };

    if (isLoaded && role === ERole.Admin && status === EProfileStatus.Approved) {
      loadUsers();
    } else if (isLoaded) {
      setIsLoading(false);
    }

    return () => {
      isCancelled = true;
    };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isLoaded, role, status]);

  const handleApprove = (userId: string) => {
    setProcessingIds((prev) => new Set(prev).add(userId));
    startTransition(async () => {
      try {
        const result = await withTimeout(approveUserAction({ userId }));
        if (!result.isSuccess) {
          throw new Error(result.error);
        }
        router.refresh();
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
    });
  };

  const handleReject = (userId: string) => {
    setProcessingIds((prev) => new Set(prev).add(userId));
    startTransition(async () => {
      try {
        const result = await withTimeout(rejectUserAction({ userId }));
        if (!result.isSuccess) {
          throw new Error(result.error);
        }
        router.refresh();
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
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (isLoaded && (role !== ERole.Admin || status !== EProfileStatus.Approved)) {
    router.replace(routes.dashboard);
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
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
                          disabled={isPending || processingIds.has(user.id)}
                          onClick={() => {
                            handleApprove(user.id);
                          }}
                        >
                          {processingIds.has(user.id) ? <Spinner className="size-3" /> : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isPending || processingIds.has(user.id)}
                          onClick={() => {
                            handleReject(user.id);
                          }}
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
