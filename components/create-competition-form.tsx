"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { TagInput } from "@/components/tag-input";
import { useCreateCompetition } from "@/src/features/dashboard/hooks";
import { CreateCompetitionSchema, CreateCompetitionFormValues } from "@/src/features/dashboard/schemas";
import { toast } from "sonner";

interface CreateCompetitionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateCompetitionForm({ onSuccess, onCancel }: CreateCompetitionFormProps) {
  const createCompetitionMutation = useCreateCompetition();

  const form = useForm({
    defaultValues: {
      name: "",
      date: new Date(),
      pegs_count: 1,
      categories: [],
    } as CreateCompetitionFormValues,
    onSubmit: async ({ value }) => {
      try {
        await createCompetitionMutation.mutateAsync(value);
        toast.success("Zawody zostały pomyślnie utworzone");
        onSuccess?.();
      } catch (error) {
        console.error("Error creating competition:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Wystąpił błąd podczas tworzenia zawodów"
        );
      }
    },
    validators: {
      onBlur: CreateCompetitionSchema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <form.Field
        name="name"
        validators={{
          onBlur: CreateCompetitionSchema.shape.name,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa zawodów</Label>
            <Input
              id="name"
              placeholder="np. Mistrzostwa Województwa"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="date"
        validators={{
          onBlur: CreateCompetitionSchema.shape.date,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label>Data zawodów</Label>
            <DatePicker
              date={field.state.value}
              onSelect={(date) => field.handleChange(date || new Date())}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="pegs_count"
        validators={{
          onBlur: CreateCompetitionSchema.shape.pegs_count,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="pegs_count">Liczba stanowisk</Label>
            <Input
              id="pegs_count"
              type="number"
              min={1}
              placeholder="1"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="categories"
        validators={{
          onBlur: CreateCompetitionSchema.shape.categories,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label>Kategorie (opcjonalne)</Label>
            <TagInput
              value={field.state.value}
              onChange={field.handleChange}
              placeholder="np. Senior, Junior, Kobiety..."
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div className="flex gap-3 pt-4">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Tworzenie..." : "Utwórz zawody"}
            </Button>
          )}
        </form.Subscribe>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={form.state.isSubmitting}
          >
            Anuluj
          </Button>
        )}
      </div>
    </form>
  );
}
