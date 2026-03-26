import type { CategoryDetail, CategorySummary } from '../types/quiz';

export async function fetchCategories(): Promise<CategorySummary[]> {
  const response = await fetch('/api/quiz/categories');
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }
  return response.json() as Promise<CategorySummary[]>;
}

export async function fetchCategory(id: string): Promise<CategoryDetail> {
  const response = await fetch(`/api/quiz/categories/${encodeURIComponent(id)}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Category not found: ${id}`);
    }
    throw new Error(`Failed to fetch category: ${response.status}`);
  }
  return response.json() as Promise<CategoryDetail>;
}
