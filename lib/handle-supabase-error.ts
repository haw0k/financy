import { showError } from '@/components/ui/ToastNotification';

interface IPostgrestErrorLike {
  code?: string;
  message?: string;
}

const PG_ERROR_MAP: Record<string, string> = {
  '23505': 'Record already exists',
  '23503': 'Cannot delete: record is linked to other data',
  '23502': 'All required fields must be filled',
  '42P01': 'Table not found',
  '42703': 'Field not found',
  '42501': 'Insufficient permissions',
  '22P02': 'Invalid data format',
  '23514': 'Data constraint violation',
};

function isPostgrestError(error: unknown): error is IPostgrestErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as IPostgrestErrorLike).code === 'string'
  );
}

function formatPostgrestError(error: IPostgrestErrorLike): string {
  const code = error.code ?? '';
  return PG_ERROR_MAP[code] ?? error.message ?? 'Ошибка базы данных';
}

function handleSupabaseError(error: unknown) {
  if (isPostgrestError(error)) {
    showError(formatPostgrestError(error));
    return;
  }

  if (error instanceof Error) {
    showError(error.message);
    return;
  }

  showError('An error occurred');
}

export { handleSupabaseError };
