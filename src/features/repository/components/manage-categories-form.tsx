'use client';

import { useState } from 'react';
import {
  FileTextIcon, ScrollTextIcon, ImageIcon, VideoIcon, TableIcon, PresentationIcon,
  FileIcon, ReceiptIcon, BriefcaseIcon, HomeIcon, Building2Icon, CameraIcon,
  FolderIcon, StarIcon, TagIcon, LockIcon, PlusIcon, Pencil, Trash2Icon, CheckIcon, XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FileCategory } from '../types';
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '../api/use-manage-categories';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

export const ICON_REGISTRY: Record<string, React.ElementType> = {
  FileText: FileTextIcon, ScrollText: ScrollTextIcon, Image: ImageIcon, Video: VideoIcon,
  Table: TableIcon, Presentation: PresentationIcon, File: FileIcon, Receipt: ReceiptIcon,
  Briefcase: BriefcaseIcon, Home: HomeIcon, Building2: Building2Icon, Camera: CameraIcon,
  Folder: FolderIcon, Star: StarIcon, Tag: TagIcon,
};

const COLOR_OPTIONS = [
  { color: 'bg-blue-50', textColor: 'text-blue-600', preview: 'bg-blue-500', label: 'Blue' },
  { color: 'bg-green-50', textColor: 'text-green-700', preview: 'bg-green-500', label: 'Green' },
  { color: 'bg-amber-50', textColor: 'text-amber-700', preview: 'bg-amber-500', label: 'Amber' },
  { color: 'bg-purple-50', textColor: 'text-purple-600', preview: 'bg-purple-500', label: 'Purple' },
  { color: 'bg-red-50', textColor: 'text-red-600', preview: 'bg-red-500', label: 'Red' },
  { color: 'bg-orange-50', textColor: 'text-orange-600', preview: 'bg-orange-500', label: 'Orange' },
  { color: 'bg-emerald-50', textColor: 'text-emerald-600', preview: 'bg-emerald-500', label: 'Emerald' },
  { color: 'bg-neutral-100', textColor: 'text-neutral-600', preview: 'bg-neutral-400', label: 'Gray' },
  { color: 'bg-pink-50', textColor: 'text-pink-600', preview: 'bg-pink-500', label: 'Pink' },
  { color: 'bg-teal-50', textColor: 'text-teal-600', preview: 'bg-teal-500', label: 'Teal' },
];

interface NewCategoryState {
  label: string;
  icon: string;
  color: string;
  textColor: string;
}

interface ManageCategoriesFormProps {
  categories: FileCategory[];
}

export const ManageCategoriesForm = ({ categories }: ManageCategoriesFormProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCat, setNewCat] = useState<NewCategoryState>({ label: '', icon: 'File', color: 'bg-neutral-100', textColor: 'text-neutral-600' });
  const [editCat, setEditCat] = useState<Partial<NewCategoryState>>({});

  const handleCreate = () => {
    if (!newCat.label.trim()) return;
    createCategory({ ...newCat, workspaceId }, {
      onSuccess: () => { setShowAdd(false); setNewCat({ label: '', icon: 'File', color: 'bg-neutral-100', textColor: 'text-neutral-600' }); },
    });
  };

  const handleUpdate = (cat: FileCategory) => {
    updateCategory({ categoryId: cat.$id, workspaceId, ...editCat }, {
      onSuccess: () => setEditingId(null),
    });
  };

  const startEdit = (cat: FileCategory) => {
    setEditingId(cat.$id);
    setEditCat({ label: cat.label, icon: cat.icon, color: cat.color, textColor: cat.textColor });
  };

  return (
    <div className="flex flex-col gap-y-3 max-h-[60vh] overflow-y-auto pr-1">
      {/* Existing categories */}
      {categories.map((cat) => {
        const Icon = ICON_REGISTRY[cat.icon] ?? FileIcon;
        const isEditing = editingId === cat.$id;
        const currentIcon = isEditing ? (editCat.icon ?? cat.icon) : cat.icon;
        const currentColor = isEditing ? (editCat.color ?? cat.color) : cat.color;
        const currentTextColor = isEditing ? (editCat.textColor ?? cat.textColor) : cat.textColor;
        const EditIcon = ICON_REGISTRY[currentIcon] ?? FileIcon;

        return (
          <div key={cat.$id} className="border rounded-lg p-3 flex flex-col gap-y-2">
            <div className="flex items-center gap-x-3">
              <div className={cn('p-2 rounded-lg shrink-0', currentColor)}>
                {isEditing ? <EditIcon className={cn('size-4', currentTextColor)} /> : <Icon className={cn('size-4', cat.textColor)} />}
              </div>
              {isEditing ? (
                <Input
                  value={editCat.label ?? ''}
                  onChange={(e) => setEditCat((p) => ({ ...p, label: e.target.value }))}
                  className="h-7 text-sm flex-1"
                  autoFocus
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{cat.label}</p>
                  {cat.isDefault && <p className="text-xs text-neutral-400">Default</p>}
                </div>
              )}
              <div className="flex items-center gap-x-1 shrink-0">
                {cat.isDefault ? (
                  <LockIcon className="size-3.5 text-neutral-300" />
                ) : isEditing ? (
                  <>
                    <Button size="icon" variant="ghost" className="size-7" onClick={() => handleUpdate(cat)} disabled={isUpdating}>
                      <CheckIcon className="size-3.5 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditingId(null)}>
                      <XIcon className="size-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="icon" variant="ghost" className="size-7" onClick={() => startEdit(cat)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => deleteCategory({ categoryId: cat.$id, workspaceId })}>
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="flex flex-col gap-y-2 pt-1 border-t">
                <div>
                  <p className="text-xs text-neutral-500 mb-1.5">Icon</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(ICON_REGISTRY).map(([key, IcoComp]) => (
                      <button key={key} onClick={() => setEditCat((p) => ({ ...p, icon: key }))}
                        className={cn('p-1.5 rounded border transition', editCat.icon === key ? 'border-green-500 bg-green-50' : 'border-neutral-200 hover:border-neutral-300')}>
                        <IcoComp className="size-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1.5">Color</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_OPTIONS.map((opt) => (
                      <button key={opt.color} onClick={() => setEditCat((p) => ({ ...p, color: opt.color, textColor: opt.textColor }))}
                        className={cn('size-5 rounded-full border-2 transition', opt.preview, editCat.color === opt.color ? 'border-green-600 scale-110' : 'border-transparent')}
                        title={opt.label} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add new category */}
      {showAdd ? (
        <div className="border border-dashed border-green-300 rounded-lg p-3 flex flex-col gap-y-2 bg-green-50/30">
          <div className="flex items-center gap-x-3">
            <div className={cn('p-2 rounded-lg shrink-0', newCat.color)}>
              {(() => { const I = ICON_REGISTRY[newCat.icon] ?? FileIcon; return <I className={cn('size-4', newCat.textColor)} />; })()}
            </div>
            <Input value={newCat.label} onChange={(e) => setNewCat((p) => ({ ...p, label: e.target.value }))}
              placeholder="Category name" className="h-7 text-sm flex-1" autoFocus />
            <Button size="icon" variant="ghost" className="size-7" onClick={handleCreate} disabled={isCreating || !newCat.label.trim()}>
              <CheckIcon className="size-3.5 text-green-600" />
            </Button>
            <Button size="icon" variant="ghost" className="size-7" onClick={() => setShowAdd(false)}>
              <XIcon className="size-3.5" />
            </Button>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1.5">Icon</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(ICON_REGISTRY).map(([key, IcoComp]) => (
                <button key={key} onClick={() => setNewCat((p) => ({ ...p, icon: key }))}
                  className={cn('p-1.5 rounded border transition', newCat.icon === key ? 'border-green-500 bg-green-50' : 'border-neutral-200 hover:border-neutral-300')}>
                  <IcoComp className="size-3.5" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1.5">Color</p>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_OPTIONS.map((opt) => (
                <button key={opt.color} onClick={() => setNewCat((p) => ({ ...p, color: opt.color, textColor: opt.textColor }))}
                  className={cn('size-5 rounded-full border-2 transition', opt.preview, newCat.color === opt.color ? 'border-green-600 scale-110' : 'border-transparent')}
                  title={opt.label} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="border-dashed w-full" onClick={() => setShowAdd(true)}>
          <PlusIcon className="size-4 mr-2" /> Add Category
        </Button>
      )}
    </div>
  );
};
