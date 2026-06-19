'use server';

import type { ICategory, ICategoryType } from '@/interfaces';
import { mapSupabaseError } from '@/lib/db-errors';
import { requireAuth } from '@/lib/require-auth';
import { categorySchema, categoryTypeSchema } from '@/schemas';
import type { TCategoryInput, TCategoryTypeInput } from '@/schemas';
import type { TAuthResult, TActionResult } from '@/types';

export async function createCategoryAction(
  input: TCategoryInput
): Promise<TAuthResult> {
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
  input: TCategoryInput;
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
  input: TCategoryTypeInput
): Promise<TAuthResult> {
  const parsed = categoryTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase
    .from('category_types')
    .insert([{ name: parsed.data.name }]);

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
  input: TCategoryTypeInput;
}): Promise<TAuthResult> {
  const parsed = categoryTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase
    .from('category_types')
    .update({ name: parsed.data.name })
    .eq('id', id);

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

export async function getCategoriesDataAction(): Promise<
  TActionResult<{
    categories: ICategory[];
    categoryTypes: ICategoryType[];
  }>
> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const [catResult, ctResult] = await Promise.all([
    authResult.supabase.from('categories').select('*').order('name'),
    authResult.supabase.from('category_types').select('*').order('name'),
  ]);

  if (catResult.error) {
    return { isSuccess: false, error: mapSupabaseError(catResult.error) };
  }
  if (ctResult.error) {
    return { isSuccess: false, error: mapSupabaseError(ctResult.error) };
  }

  return {
    isSuccess: true,
    data: {
      categories: catResult.data ?? [],
      categoryTypes: ctResult.data ?? [],
    },
  };
}
