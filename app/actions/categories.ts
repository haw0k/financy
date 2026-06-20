'use server';

import type { ICategory, ICategoryType } from '@/interfaces';
import { mapSupabaseError } from '@/lib/db-errors';
import { requireApprovedUser } from '@/lib/require-auth';
import { categorySchema, categoryTypeSchema } from '@/schemas';
import { CATEGORY_MSGS } from '@/messages';
import type { TCategoryInput, TCategoryTypeInput } from '@/schemas';
import type { TActionResult } from '@/types';

export async function createCategoryAction(input: TCategoryInput): Promise<TActionResult<void>> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  // Validate type_id references an existing category type
  if (parsed.data.type_id) {
    const { data: ct, error: ctError } = await authResult.supabase
      .from('category_types')
      .select('id')
      .eq('id', parsed.data.type_id)
      .maybeSingle();

    if (ctError) {
      return { isSuccess: false, error: mapSupabaseError(ctError) };
    }
    if (!ct) {
      return { isSuccess: false, error: CATEGORY_MSGS.TYPE_NOT_SELECTED };
    }
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

  return { isSuccess: true, data: undefined };
}

export async function updateCategoryAction({
  id,
  input,
}: {
  id: string;
  input: TCategoryInput;
}): Promise<TActionResult<void>> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  // Validate type_id references an existing category type
  if (parsed.data.type_id) {
    const { data: ct, error: ctError } = await authResult.supabase
      .from('category_types')
      .select('id')
      .eq('id', parsed.data.type_id)
      .maybeSingle();

    if (ctError) {
      return { isSuccess: false, error: mapSupabaseError(ctError) };
    }
    if (!ct) {
      return { isSuccess: false, error: CATEGORY_MSGS.TYPE_NOT_SELECTED };
    }
  }

  const { data: updated, error } = await authResult.supabase
    .from('categories')
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color,
      type_id: parsed.data.type_id ?? null,
    })
    .eq('id', id)
    .select('id');

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!updated?.length) {
    return { isSuccess: false, error: CATEGORY_MSGS.NOT_FOUND };
  }

  return { isSuccess: true, data: undefined };
}

export async function deleteCategoryAction({ id }: { id: string }): Promise<TActionResult<void>> {
  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data: deleted, error } = await authResult.supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!deleted?.length) {
    return { isSuccess: false, error: CATEGORY_MSGS.NOT_FOUND };
  }

  return { isSuccess: true, data: undefined };
}

export async function createCategoryTypeAction(input: TCategoryTypeInput): Promise<TActionResult<void>> {
  const parsed = categoryTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase
    .from('category_types')
    .insert([{ name: parsed.data.name }]);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true, data: undefined };
}

export async function updateCategoryTypeAction({
  id,
  input,
}: {
  id: string;
  input: TCategoryTypeInput;
}): Promise<TActionResult<void>> {
  const parsed = categoryTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data: updated, error } = await authResult.supabase
    .from('category_types')
    .update({ name: parsed.data.name })
    .eq('id', id)
    .select('id');

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!updated?.length) {
    return { isSuccess: false, error: CATEGORY_MSGS.TYPE_NOT_FOUND };
  }

  return { isSuccess: true, data: undefined };
}

export async function deleteCategoryTypeAction({ id }: { id: string }): Promise<TActionResult<void>> {
  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data: deleted, error } = await authResult.supabase
    .from('category_types')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!deleted?.length) {
    return { isSuccess: false, error: CATEGORY_MSGS.TYPE_NOT_FOUND };
  }

  return { isSuccess: true, data: undefined };
}

export async function getCategoriesDataAction(): Promise<
  TActionResult<{
    categories: ICategory[];
    categoryTypes: ICategoryType[];
  }>
> {
  const authResult = await requireApprovedUser();
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
