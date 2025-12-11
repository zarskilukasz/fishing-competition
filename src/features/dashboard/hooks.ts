import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompetitions, createCompetition, createCategory } from "@/lib/api/competitions";
import { CreateCompetitionFormValues } from "./schemas";

// Query keys
export const COMPETITIONS_QUERY_KEY = ['competitions'];

// Hooks
export function useCompetitions() {
  return useQuery({
    queryKey: COMPETITIONS_QUERY_KEY,
    queryFn: getCompetitions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCompetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompetitionFormValues) => {
      // Create competition first
      const competition = await createCompetition({
        name: data.name,
        date: data.date.toISOString(),
        pegs_count: data.pegs_count,
      });

      // Create categories if any
      if (data.categories.length > 0) {
        await Promise.all(
          data.categories.map(categoryName =>
            createCategory(competition.id, { name: categoryName })
          )
        );
      }

      return competition;
    },
    onSuccess: () => {
      // Invalidate and refetch competitions
      queryClient.invalidateQueries({ queryKey: COMPETITIONS_QUERY_KEY });
    },
  });
}
