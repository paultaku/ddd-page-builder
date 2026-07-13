import type { MediaItem } from "./MediaItem";

// Port for the Media Library: media items + their categories. Filesystem now,
// swappable for an object store later.
export interface MediaRepository {
  listItems(ownerId: string): Promise<MediaItem[]>;
  findItem(id: string): Promise<MediaItem | null>;
  saveItem(item: MediaItem): Promise<MediaItem>;
  deleteItem(id: string): Promise<boolean>;

  listCategories(): Promise<string[]>;
  addCategory(name: string): Promise<string[]>;
  removeCategory(name: string): Promise<string[]>;
}
