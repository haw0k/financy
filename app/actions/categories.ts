'use server';

import { cacheTag, cacheLife as nextCacheLife, revalidateTag } from 'next/cache';
import { mapSupabaseError } from '@/lib/db-errors';
import { requireApprovedUser } from '@/lib/require-auth';
import { CACHE_TAGS, dashboardCacheLife, mutationRevalidateProfile } from '@/config';
import { categorySchema, categoryTypeSchema } from '@/schemas';
import { CATEGORY_MSGS } from '@/messages';
import type { TCategoryInput, TCategoryTypeInput } from '@/schemas';
import type { ICategory, ICategoryType } from '@/interfaces';
import type { TActionResult } from '@/types';

export async function createCategoryAction(
  input: TCategoryInput
): Promise<TActionResult<ICategory>> {
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

  const { data: created, error } = await authResult.supabase
    .from('categories')
    .insert([
      {
        name: parsed.data.name,
        type: parsed.data.type,
        color: parsed.data.color,
        icon: parsed.data.icon,
        type_id: parsed.data.type_id ?? null,
      },
    ])
    .select()
    .single();

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!created) {
    return { isSuccess: false, error: CATEGORY_MSGS.CREATE_FAILED };
  }

  revalidateTag(CACHE_TAGS.categories, mutationRevalidateProfile);

  return { isSuccess: true, data: created };
}

export async function updateCategoryAction({
  id,
  input,
}: {
  id: string;
  input: TCategoryInput;
}): Promise<TActionResult<ICategory>> {
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
      icon: parsed.data.icon,
      type_id: parsed.data.type_id ?? null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!updated) {
    return { isSuccess: false, error: CATEGORY_MSGS.NOT_FOUND };
  }

  revalidateTag(CACHE_TAGS.categories, mutationRevalidateProfile);

  return { isSuccess: true, data: updated };
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
    .select()
    .single();

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!deleted) {
    return { isSuccess: false, error: CATEGORY_MSGS.NOT_FOUND };
  }

  revalidateTag(CACHE_TAGS.categories, mutationRevalidateProfile);

  return { isSuccess: true, data: undefined };
}

export async function createCategoryTypeAction(
  input: TCategoryTypeInput
): Promise<TActionResult<ICategoryType>> {
  const parsed = categoryTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data: created, error } = await authResult.supabase
    .from('category_types')
    .insert([{ name: parsed.data.name, icon: parsed.data.icon }])
    .select()
    .single();

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!created) {
    return { isSuccess: false, error: CATEGORY_MSGS.CREATE_TYPE_FAILED };
  }

  revalidateTag(CACHE_TAGS.categoryTypes, mutationRevalidateProfile);

  return { isSuccess: true, data: created };
}

export async function updateCategoryTypeAction({
  id,
  input,
}: {
  id: string;
  input: TCategoryTypeInput;
}): Promise<TActionResult<ICategoryType>> {
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
    .update({ name: parsed.data.name, icon: parsed.data.icon })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!updated) {
    return { isSuccess: false, error: CATEGORY_MSGS.TYPE_NOT_FOUND };
  }

  revalidateTag(CACHE_TAGS.categoryTypes, mutationRevalidateProfile);

  return { isSuccess: true, data: updated };
}

export async function deleteCategoryTypeAction({
  id,
}: {
  id: string;
}): Promise<TActionResult<void>> {
  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data: deleted, error } = await authResult.supabase
    .from('category_types')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!deleted) {
    return { isSuccess: false, error: CATEGORY_MSGS.TYPE_NOT_FOUND };
  }

  revalidateTag(CACHE_TAGS.categoryTypes, mutationRevalidateProfile);

  return { isSuccess: true, data: undefined };
}

export async function getCategoriesDataAction(): Promise<
  TActionResult<{
    categories: ICategory[];
    categoryTypes: ICategoryType[];
  }>
> {
  'use cache: private';
  cacheTag(CACHE_TAGS.categories, CACHE_TAGS.categoryTypes);
  nextCacheLife(dashboardCacheLife);

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
