"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import type { MediaItem } from "@/domain/media/MediaItem";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [newCategory, setNewCategory] = useState("");
  const [uploadCategory, setUploadCategory] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setItems(data.items ?? []);
      setCategories(data.categories ?? []);
    } catch {
      toast.error("Failed to load media");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --- Upload ---
  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const dataUrl = await readFileAsDataUrl(file);
        const res = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            dataUrl,
            category: uploadCategory || null,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }
      }
      toast.success("Uploaded");
      if (fileInputRef.current) fileInputRef.current.value = "";
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // --- Item functions ---
  const rename = async (item: MediaItem) => {
    const name = window.prompt("Rename file", item.filename);
    if (!name || name === item.filename) return;
    await fetch(`/api/media/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: name }),
    });
    load();
  };

  const setItemCategory = async (item: MediaItem, category: string) => {
    await fetch(`/api/media/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: category || null }),
    });
    load();
  };

  const remove = async (item: MediaItem) => {
    if (!window.confirm(`Delete "${item.filename}"?`)) return;
    await fetch(`/api/media/${item.id}`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  };

  // --- Category functions ---
  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    const res = await fetch("/api/media/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setNewCategory("");
      load();
    } else {
      toast.error("Failed to add category");
    }
  };

  const removeCategory = async (name: string) => {
    if (!window.confirm(`Remove category "${name}"? Items keep their files.`))
      return;
    await fetch(`/api/media/categories/${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
    if (filter === name) setFilter("all");
    load();
  };

  const visibleItems =
    filter === "all"
      ? items
      : filter === "uncategorized"
      ? items.filter((i) => !i.category)
      : items.filter((i) => i.category === filter);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Media Library</h1>

        {/* Upload */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Upload</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              disabled={uploading}
              onChange={(e) => onUpload(e.target.files)}
              className="text-sm"
            />
            <label className="text-sm text-gray-600">
              into{" "}
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-sm"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            {uploading && (
              <span className="text-sm text-blue-600">Uploading…</span>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Categories
          </h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {categories.length === 0 && (
              <span className="text-sm text-gray-500">No categories yet.</span>
            )}
            {categories.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
              >
                {c}
                <button
                  onClick={() => removeCategory(c)}
                  className="text-gray-400 hover:text-red-600"
                  title="Remove category"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="New category"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            <button
              onClick={addCategory}
              className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
            >
              Add
            </button>
          </div>
        </section>

        {/* Library */}
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Files ({visibleItems.length})
            </h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="uncategorized">Uncategorized</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {visibleItems.length === 0 ? (
            <p className="text-sm text-gray-500">No files here yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-gray-200"
                >
                  <div className="flex h-28 items-center justify-center bg-gray-100">
                    {item.mimeType.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.dataUrl}
                        alt={item.filename}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs uppercase text-gray-400">
                        {item.mimeType.split("/")[1] || "file"}
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p
                      className="truncate text-xs font-medium text-gray-800"
                      title={item.filename}
                    >
                      {item.filename}
                    </p>
                    <p className="mb-2 text-[11px] text-gray-400">
                      {formatBytes(item.size)}
                    </p>
                    <select
                      value={item.category ?? ""}
                      onChange={(e) => setItemCategory(item, e.target.value)}
                      className="mb-2 w-full rounded border border-gray-200 px-1 py-0.5 text-[11px]"
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2 text-[11px]">
                      <button
                        onClick={() => rename(item)}
                        className="text-blue-600 hover:underline"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => remove(item)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Toaster />
    </main>
  );
}
