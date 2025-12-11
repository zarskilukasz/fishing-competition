import { z } from "zod";
import { CompetitionStatus } from "@/types/database.types";

// DTO - Data Transfer Object
export interface CompetitionDTO {
  id: string;
  name: string;
  date: string; // ISO String
  pegs_count: number;
  status: CompetitionStatus;
  participants_count?: number; // Opcjonalnie, jeśli API to zwraca (join)
}

// Form values
export interface CreateCompetitionFormValues {
  name: string;
  date: Date;
  pegs_count: number;
  categories: string[]; // Nazwy kategorii do utworzenia
}

// Zod Schema for form validation
export const CreateCompetitionSchema = z.object({
  name: z.string().min(3, { message: "Nazwa musi mieć minimum 3 znaki" }),
  date: z.date({
    required_error: "Data jest wymagana",
    invalid_type_error: "Nieprawidłowy format daty"
  }),
  pegs_count: z.number({
    required_error: "Liczba stanowisk jest wymagana",
    invalid_type_error: "Liczba stanowisk musi być liczbą"
  }).int().positive().min(1, { message: "Minimum 1 stanowisko" }),
  categories: z.array(z.string()).refine(
    (categories) => {
      // Sprawdzamy unikalność nazw kategorii
      const uniqueCategories = new Set(categories.map(cat => cat.toLowerCase()));
      return uniqueCategories.size === categories.length;
    },
    {
      message: "Nazwy kategorii muszą być unikalne"
    }
  )
});

export type CreateCompetitionInput = z.infer<typeof CreateCompetitionSchema>;
