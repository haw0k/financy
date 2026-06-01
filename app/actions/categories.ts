'use server';

import { z } from 'zod';
import { mapSupabaseError } from '@/lib/db-errors';
import { requireAuth } from '@/lib/require-auth';
import { AUTH_MSGS } from '@/messages';
import type { TAuthResult } from '@/types';
import type { TActionResult } from '@/types';

const categorySchema = z.object({
  name: z.string().min(1, { error: 'Name is required' }),
  type: z.enum(['income', 'expense'], { error: AUTH_MSGS.INVALID_ROLE }),
  color: z.string().min(1, { error: 'Color is required' }),
  type_id: z.string().optional(),
});

const categoryTypeSchema = z.object({
  name: z.string().min(1, { error: 'Name is required' }),
});

export async function getCategoriesAction(): Promise<
  TActionResult<{ id: string; name: string; type: 'income' | 'expense'; color: string; type_id?: string }[]>
> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data, error } = await authResult.supabase.from('categories').select('*').order('name');

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true, data: data ?? [] };
}

export async function getCategoryTypesAction(): Promise<
  TActionResult<{ id: string; name: string }[]>
> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data, error } = await authResult.supabase.from('category_types').select('*').order('name');

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true, data: data ?? [] };
}

export async function createCategoryAction(input: z.infer<typeof categorySchema>): Promise<TAuthResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase.from('categories').insert([
    {
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color,
      type_id: parsed.data.type_id ?? null,
    },
  ]);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true };
}

export async function updateCategoryAction({
  id,
  input,
}: {
  id: string;
  input: z.infer<typeof categorySchema>;
}): Promise<TAuthResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase
    .from('categories')
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color,
      type_id: parsed.data.type_id ?? null,
    })
    .eq('id', id);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true };
}

export async function deleteCategoryAction({ id }: { id: string }): Promise<TAuthResult> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase.from('categories').delete().eq('id', id);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true };
}

export async function createCategoryTypeAction(
  input: z.infer<typeof categoryTypeSchema>,
): Promise<TAuthResult> {
  const parsed = categoryTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase.from('category_types').insert([{ name: parsed.data.name }]);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true };
}

export async function updateCategoryTypeAction({
  id,
  input,
}: {
  id: string;
  input: z.infer<typeof categoryTypeSchema>;
}): Promise<TAuthResult> {
  const parsed = categoryTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase.from('category_types').update({ name: parsed.data.name }).eq('id', id);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true };
}

export async function deleteCategoryTypeAction({ id }: { id: string }): Promise<TAuthResult> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase.from('category_types').delete().eq('id', id);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true };
}

export async function getCategoriesDataAction(): Promise<{
  categories: { id: string; name: string; type: 'income' | 'expense'; color: string; type_id?: string }[];
  categoryTypes: { id: string; name: string }[];
}> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    throw new Error(authResult.error);
  }

  const [catResult, ctResult] = await Promise.all([
    authResult.supabase.from('categories').select('*').order('name'),
    authResult.supabase.from('category_types').select('*').order('name'),
  ]);

  return {
    categories: catResult.data ?? [],
    categoryTypes: ctResult.data ?? [],
  };
}