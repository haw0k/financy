'use client';

import { type FC, type SubmitEvent, useState, useTransition } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/lib/shadcn';
import {
  NewButton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  showError,
} from '@/components/ui';
import { withTimeout } from '@/lib/with-timeout';
import {
  createCategoryAction,
  createCategoryTypeAction,
  deleteCategoryAction,
  deleteCategoryTypeAction,
  updateCategoryAction,
  updateCategoryTypeAction,
} from '@/app/actions/categories';
import { CATEGORY_MSGS } from '@/messages';
import type { ICategory, ICategoryType, ICategoryTypeInput } from '@/interfaces';

interface ICategoriesTableClient {
  initialCategories: ICategory[];
  initialCategoryTypes: ICategoryType[];
}

export const CategoriesTableClient: FC<ICategoriesTableClient> = ({
  initialCategories,
  initialCategoryTypes,
}) => {
  const [categories, setCategories] = useState<ICategory[]>(initialCategories);
  const [categoryTypes, setCategoryTypes] = useState<ICategoryType[]>(initialCategoryTypes);
  const [isShowForm, setIsShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const DEFAULT_CATEGORY_COLOR = 'var(--chart-3)';

  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: DEFAULT_CATEGORY_COLOR,
    type_id: '',
  });
  const [ctFormData, setCtFormData] = useState<ICategoryTypeInput>({ name: '' });
  const [ctEditingId, setCtEditingId] = useState<string | null>(null);
  const [isCtShowForm, setCtIsShowForm] = useState(false);
  const [ctDeleteId, setCtDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCtSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const isEdit = !!ctEditingId;
        const result = await withTimeout(
          isEdit
            ? updateCategoryTypeAction({ id: ctEditingId, input: { name: ctFormData.name } })
            : createCategoryTypeAction({ name: ctFormData.name })
        );

        if (result.isSuccess) {
          if (isEdit) {
            setCategoryTypes(
              categoryTypes.map((ct) =>
                ct.id === ctEditingId ? { ...ct, name: ctFormData.name } : ct
              )
            );
          } else {
            // Optimistic add with temp ID; router.refresh() will correct it
            setCategoryTypes([
              ...categoryTypes,
              { id: `temp-${Date.now()}`, name: ctFormData.name },
            ]);
          }
          setCtFormData({ name: '' });
          setCtEditingId(null);
          setCtIsShowForm(false);
          router.refresh();
        } else if (result.error) {
          showError('Categories', result.error);
        }
      } catch {
        showError('Categories', CATEGORY_MSGS.TIMEOUT);
      }
    });
  };

  const handleCtEdit = (ct: ICategoryType) => {
    setCtFormData({ name: ct.name });
    setCtEditingId(ct.id);
    setCtIsShowForm(true);
  };

  const handleCtDelete = (id: string) => {
    startTransition(async () => {
      try {
        const result = await withTimeout(deleteCategoryTypeAction({ id }));
        if (result.isSuccess) {
          setCategoryTypes(categoryTypes.filter((ct) => ct.id !== id));
          setCtDeleteId(null);
        } else if (result.error) {
          showError('Categories', result.error);
        }
      } catch {
        showError('Categories', CATEGORY_MSGS.TIMEOUT);
      }
    });
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const input: { name: string; type: 'income' | 'expense'; color: string; type_id?: string } = {
      name: formData.name,
      type: formData.type,
      color: formData.color,
    };
    if (formData.type_id) {
      input.type_id = formData.type_id;
    }

    startTransition(async () => {
      try {
        const isEdit = !!editingId;
        const result = await withTimeout(
          isEdit ? updateCategoryAction({ id: editingId, input }) : createCategoryAction(input)
        );

        if (result.isSuccess) {
          if (isEdit) {
            setCategories(
              categories.map((c) =>
                c.id === editingId
                  ? {
                      ...c,
                      name: formData.name,
                      type: formData.type,
                      color: formData.color,
                      type_id: formData.type_id || undefined,
                    }
                  : c
              )
            );
          } else {
            // Optimistic add with temp ID; router.refresh() will correct it
            setCategories([
              ...categories,
              {
                id: `temp-${Date.now()}`,
                name: formData.name,
                type: formData.type,
                color: formData.color,
                type_id: formData.type_id || undefined,
              },
            ]);
          }
          setFormData({ name: '', type: 'expense', color: DEFAULT_CATEGORY_COLOR, type_id: '' });
          setEditingId(null);
          setIsShowForm(false);
          router.refresh();
        } else if (result.error) {
          showError('Categories', result.error);
        }
      } catch {
        showError('Categories', CATEGORY_MSGS.TIMEOUT);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        const result = await withTimeout(deleteCategoryAction({ id }));
        if (result.isSuccess) {
          setCategories(categories.filter((c) => c.id !== id));
        } else if (result.error) {
          showError('Categories', result.error);
        }
      } catch {
        showError('Categories', CATEGORY_MSGS.TIMEOUT);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Categories</CardTitle>
            </div>
            <NewButton
              onClick={() => {
                setIsShowForm(true);
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {isShowForm && (
            <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-xl border bg-card p-6">
              <fieldset className="min-w-0 space-y-4 rounded-lg border px-4 pb-4">
                <legend className="px-2 text-sm font-medium text-foreground">
                  {editingId ? 'Edit Category' : 'New Category'}
                </legend>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="gap-0.5 text-xs text-muted-foreground">
                      Category Name
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Groceries"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="gap-0.5 text-xs text-muted-foreground">
                      Type
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) =>
                        setFormData({ ...formData, type: v as 'income' | 'expense' })
                      }
                    >
                      <SelectTrigger className="w-full" id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type_id" className="text-xs text-muted-foreground">
                      Category Type
                    </Label>
                    <Select
                      value={formData.type_id}
                      onValueChange={(v) => {
                        setFormData({ ...formData, type_id: v });
                      }}
                    >
                      <SelectTrigger className="w-full" id="type_id">
                        <SelectValue placeholder="Select type (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryTypes.map((ct) => (
                          <SelectItem key={ct.id} value={ct.id}>
                            {ct.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color" className="text-xs text-muted-foreground">
                      Color
                    </Label>
                    <div className="relative h-8 w-8 shrink-0 rounded-full focus-within:ring-[3px] focus-within:ring-ring/50">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => {
                          setFormData({ ...formData, color: e.target.value });
                        }}
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 rounded-full border border-border"
                        style={{ backgroundColor: formData.color }}
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <div className="flex justify-end gap-4 pt-2">
                <Button type="submit" disabled={isPending || !formData.name}>
                  {isPending ? 'Saving...' : editingId ? 'Update' : 'Add'} Category
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    setIsShowForm(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      type: 'expense',
                      color: DEFAULT_CATEGORY_COLOR,
                      type_id: '',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {categories.length === 0 ? (
            <div className="text-center text-muted-foreground">No categories yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category Type</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const categoryType = categoryTypes.find((ct) => ct.id === category.type_id);
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              category.type === 'income'
                                ? 'bg-primary/15 text-primary border-primary/20 dark:bg-primary/25'
                                : 'bg-destructive/15 text-destructive border-destructive/20 dark:bg-destructive/25'
                            }
                          >
                            {category.type === 'income' ? 'Income' : 'Expense'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{categoryType?.name || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 w-6 rounded border border-border"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm text-muted-foreground">{category.color}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Edit category"
                              onClick={() => {
                                setEditingId(category.id);
                                setFormData({
                                  name: category.name,
                                  type: category.type,
                                  color: category.color,
                                  type_id: category.type_id || '',
                                });
                                setIsShowForm(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Delete category"
                              onClick={() => {
                                handleDelete(category.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Category Types</CardTitle>
            </div>
            <NewButton
              onClick={() => {
                setCtIsShowForm(true);
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {isCtShowForm && (
            <form
              onSubmit={handleCtSubmit}
              className="mb-6 space-y-4 rounded-xl border bg-card p-6"
            >
              <fieldset className="min-w-0 space-y-4 rounded-lg border px-4 pb-4">
                <legend className="px-2 text-sm font-medium text-foreground">
                  {ctEditingId ? 'Edit Category Type' : 'New Category Type'}
                </legend>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ctName" className="gap-0.5 text-xs text-muted-foreground">
                      Type Name
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="ctName"
                      placeholder="e.g., Consumer goods"
                      value={ctFormData.name}
                      onChange={(e) => {
                        setCtFormData({ name: e.target.value });
                      }}
                      required
                    />
                  </div>
                </div>
              </fieldset>

              <div className="flex justify-end gap-4 pt-2">
                <Button type="submit" disabled={isPending || !ctFormData.name}>
                  {isPending ? 'Saving...' : ctEditingId ? 'Update' : 'Add'} Type
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    setCtIsShowForm(false);
                    setCtEditingId(null);
                    setCtFormData({ name: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {categoryTypes.length === 0 ? (
            <div className="text-center text-muted-foreground">No category types yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryTypes.map((ct) => (
                    <TableRow key={ct.id}>
                      <TableCell className="font-medium">{ct.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Edit category type"
                            onClick={() => {
                              handleCtEdit(ct);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Delete category type"
                            onClick={() => {
                              setCtDeleteId(ct.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={ctDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setCtDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Categories using this type will have the type removed but won&apos;t be deleted. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (ctDeleteId) handleCtDelete(ctDeleteId);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
