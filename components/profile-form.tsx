"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChangePasswordSchema, type ChangePasswordInput } from "@/src/features/auth/schemas";
import { toast } from "sonner";

interface ProfileFormProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const supabase = createClient();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    } as ChangePasswordInput,
    onSubmit: async ({ value }) => {
      try {
        // Update password using Supabase
        const { error } = await supabase.auth.updateUser({
          password: value.newPassword
        });

        if (error) {
          throw error;
        }

        toast.success("Hasło zostało pomyślnie zmienione");
        form.reset();
      } catch (error) {
        console.error('Error updating password:', error);
        toast.error("Błąd zmiany hasła", {
          description: error instanceof Error ? error.message : 'Wystąpił błąd podczas zmiany hasła'
        });
      }
    },
    validators: {
      onBlur: ChangePasswordSchema,
    },
  });

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profil</h1>
        <p className="text-muted-foreground mt-2">
          Zarządzaj swoimi ustawieniami konta
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informacje o profilu</CardTitle>
            <CardDescription>
              Twoje podstawowe informacje konta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={user.email || ""}
                  disabled
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email nie może być zmieniony
                </p>
              </div>
              {user.user_metadata?.full_name && (
                <div>
                  <label className="text-sm font-medium">Imię i nazwisko</label>
                  <Input
                    value={user.user_metadata.full_name}
                    disabled
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>Zmiana hasła</CardTitle>
            <CardDescription>
              Zmień hasło do swojego konta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              noValidate
            >
              <form.Field
                name="currentPassword"
                validators={{
                  onBlur: ChangePasswordSchema.shape.currentPassword,
                }}
              >
                {(field) => (
                  <Field>
                    <label className="text-sm font-medium">Aktualne hasło</label>
                    <div className="relative mt-1">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Wprowadź aktualne hasło"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {field.state.meta.errors && (
                      <FieldDescription className="text-red-500">
                        {field.state.meta.errors.map(error => error?.message || 'Nieprawidłowa wartość').join(', ')}
                      </FieldDescription>
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="newPassword"
                validators={{
                  onBlur: ChangePasswordSchema.shape.newPassword,
                }}
              >
                {(field) => (
                  <Field>
                    <label className="text-sm font-medium">Nowe hasło</label>
                    <div className="relative mt-1">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Wprowadź nowe hasło"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {field.state.meta.errors && (
                      <FieldDescription className="text-red-500">
                        {field.state.meta.errors.map(error => error?.message || 'Nieprawidłowa wartość').join(', ')}
                      </FieldDescription>
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="confirmPassword"
                validators={{
                  onBlur: ChangePasswordSchema.shape.confirmPassword,
                }}
              >
                {(field) => (
                  <Field>
                    <label className="text-sm font-medium">Potwierdź nowe hasło</label>
                    <div className="relative mt-1">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Potwierdź nowe hasło"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {field.state.meta.errors && (
                      <FieldDescription className="text-red-500">
                        {field.state.meta.errors.map(error => error?.message || 'Nieprawidłowa wartość').join(', ')}
                      </FieldDescription>
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit} className="w-full">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Zmiana hasła...
                      </>
                    ) : (
                      'Zmień hasło'
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
