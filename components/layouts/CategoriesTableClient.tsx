'use client';

import { type FC, useState, useTransition, type SubmitEvent } from 'react';
import { showError } from '@/components/ui';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  createCategoryTypeAction,
  updateCategoryTypeAction,
  deleteCategoryTypeAction,
} from '@/app/actions/categories';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/lib/shadcn';
import { Plus, Trash2, Edit2 } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3b82f6',
    type_id: '',
  });
  const [ctFormData, setCtFormData] = useState<ICategoryTypeInput>({ name: '' });
  const [ctEditingId, setCtEditingId] = useState<string | null>(null);
  const [isCtShowForm, setCtIsShowForm] = useState(false);
  const [ctDeleteId, setCtDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCtSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      const result = ctEditingId
        ? await updateCategoryTypeAction({ id: ctEditingId, input: { name: ctFormData.name } })
        : await createCategoryTypeAction({ name: ctFormData.name });

      if (result.isSuccess) {
        setCtFormData({ name: '' });
        setCtEditingId(null);
        setCtIsShowForm(false);
        window.location.reload();
      } else if (result.error) {
        showError('Categories', result.error);
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
      const result = await deleteCategoryTypeAction({ id });
      if (result.isSuccess) {
        setCategoryTypes(categoryTypes.filter((ct) => ct.id !== id));
        setCtDeleteId(null);
      } else if (result.error) {
        showError('Categories', result.error);
      }
    });
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const input = {
      name: formData.name,
      type: formData.type,
      color: formData.color,
      type_id: formData.type_id || undefined,
    };

    startTransition(async () => {
      const result = editingId
        ? await updateCategoryAction({ id: editingId, input })
        : await createCategoryAction(input);

      if (result.isSuccess) {
        setFormData({ name: '', type: 'expense', color: '#3b82f6', type_id: '' });
        setEditingId(null);
        setIsShowForm(false);
        window.location.reload();
      } else if (result.error) {
        showError('Categories', result.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteCategoryAction({ id });
      if (result.isSuccess) {
        setCategories(categories.filter((c) => c.id !== id));
      } else if (result.error) {
        showError('Categories', result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage your expense and income categories</CardDescription>
            </div>
            <Button
              onClick={() => {
                setIsShowForm(true);
              }}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {isShowForm && (
            <Card className="bg-accent/50">
              <CardHeader>
                <CardTitle className="text-base">
                  {editingId ? 'Edit Category' : 'Add New Category'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="name">Category Name</Label>
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
                      <Label htmlFor="type">Type</Label>
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
                      <Label htmlFor="color">Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color"
                          type="color"
                          value={formData.color}
                          onChange={(e) => {
                            setFormData({ ...formData, color: e.target.value });
                          }}
                          className="h-10 w-14 cursor-pointer p-1"
                        />
                        <Input
                          type="text"
                          value={formData.color}
                          onChange={(e) => {
                            setFormData({ ...formData, color: e.target.value });
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type_id">Category Type</Label>
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
                  </div>

                  <div className="flex gap-2">
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
                        setFormData({ name: '', type: 'expense', color: '#3b82f6', type_id: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
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
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                              category.type === 'income'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}
                          >
                            {category.type === 'income' ? 'Income' : 'Expense'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {categoryType?.name || '-'}
                          </span>
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
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
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
                              size="sm"
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
              <CardTitle>Category Types</CardTitle>
              <CardDescription>Manage category types</CardDescription>
            </div>
            <Button
              onClick={() => {
                setCtIsShowForm(true);
              }}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Category Type
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {isCtShowForm && (
            <Card className="bg-accent/50">
              <CardHeader>
                <CardTitle className="text-base">
                  {ctEditingId ? 'Edit Category Type' : 'Add New Category Type'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCtSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ctName">Type Name</Label>
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

                  <div className="flex gap-2">
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
              </CardContent>
            </Card>
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleCtEdit(ct);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
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
