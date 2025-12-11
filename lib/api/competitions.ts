import { CompetitionDTO } from "@/src/features/dashboard/schemas";
import { Category } from "@/src/types/database.types";

interface CreateCompetitionPayload {
  name: string;
  date: string;
  pegs_count: number;
}

interface CreateCategoryPayload {
  name: string;
}

// API client functions
export async function getCompetitions(): Promise<CompetitionDTO[]> {
  const response = await fetch('/api/competitions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data: CompetitionDTO[] = await response.json();
  return data;
}

export async function createCompetition(payload: CreateCompetitionPayload): Promise<CompetitionDTO> {
  const response = await fetch('/api/competitions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data: CompetitionDTO = await response.json();
  return data;
}

export async function createCategory(competitionId: string, payload: CreateCategoryPayload): Promise<Category> {
  const response = await fetch(`/api/competitions/${competitionId}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data: Category = await response.json();
  return data;
}
