'use client';

import { type FC, useEffect, useState, type SubmitEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
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

interface ICategoriesTable {
  userId: string;
}

export const CategoriesTable: FC<ICategoriesTable> = ({ userId }) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<ICategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const supabase = createClient();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryTypes = async () => {
    try {
      const { data, error } = await supabase.from('category_types').select('*').order('name');

      if (error) throw error;
      setCategoryTypes(data || []);
    } catch (error) {
      console.error('Error fetching category types:', error);
    }
  };

  const handleCtSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (ctEditingId) {
        const { error } = await supabase
          .from('category_types')
          .update({ name: ctFormData.name })
          .eq('id', ctEditingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('category_types').insert([{ name: ctFormData.name }]);

        if (error) throw error;
      }

      setCtFormData({ name: '' });
      setCtEditingId(null);
      setCtIsShowForm(false);
      fetchCategoryTypes();
    } catch (error) {
      console.error('Error submitting category type:', error);
    }
  };

  const handleCtEdit = (ct: ICategoryType) => {
    setCtFormData({ name: ct.name });
    setCtEditingId(ct.id);
    setCtIsShowForm(true);
  };

  const handleCtDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('category_types').delete().eq('id', id);

      if (error) throw error;
      setCategoryTypes(categoryTypes.filter((ct) => ct.id !== id));
      setCtDeleteId(null);
    } catch (error) {
      console.error('Error deleting category type:', error);
    }
  };

  useEffect(() => {
    if (!userId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
    fetchCategoryTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            type: formData.type,
            color: formData.color,
            type_id: formData.type_id || null,
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([
          {
            user_id: userId,
            name: formData.name,
            type: formData.type,
            color: formData.color,
            type_id: formData.type_id || null,
          },
        ]);

        if (error) throw error;
      }

      setFormData({ name: '', type: 'expense', color: '#3b82f6', type_id: '' });
      setEditingId(null);
      setIsShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Error submitting category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
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
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
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
                      <select
                        id="type_id"
                        value={formData.type_id}
                        onChange={(e) => {
                          setFormData({ ...formData, type_id: e.target.value });
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select type (optional)</option>
                        {categoryTypes.map((ct) => (
                          <option key={ct.id} value={ct.id}>
                            {ct.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={!formData.name}>
                      {editingId ? 'Update' : 'Add'} Category
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
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

          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : categories.length === 0 ? (
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
          <div className="flex items-center justify-between">
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
                    <Button type="submit" disabled={!ctFormData.name}>
                      {ctEditingId ? 'Update' : 'Add'} Type
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
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
