"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "@tanstack/react-form"
import { ResetPasswordSchema, type ResetPasswordInput } from "@/src/features/auth/schemas"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const supabase = createClient()

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    } as ResetPasswordInput,
    validators: {
      onChange: ResetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { error } = await supabase.auth.updateUser({
          password: value.password
        })

        if (error) {
          toast.error("Błąd zmiany hasła", {
            description: error.message,
          })
          return
        }

        toast.success("Hasło zostało zmienione", {
          description: "Możesz teraz zalogować się nowym hasłem.",
        })
        router.push("/login")
      } catch (error) {
        console.error(error)
        toast.error("Wystąpił nieoczekiwany błąd")
      }
    },
  })

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }} 
      noValidate 
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Zresetuj swoje hasło</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Wypełnij formularz poniżej, aby zresetować hasło
          </p>
        </div>
        <form.Field name="password">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="password">Hasło</FieldLabel>
              <Input 
                id="password" 
                type="password" 
                value={field.state.value} 
                onBlur={field.handleBlur} 
                onChange={(e) => field.handleChange(e.target.value)} 
                placeholder="********"
              />
              {field.state.meta.errors && (
                <FieldDescription className="text-red-500">
                  {field.state.meta.errors.map(error => error?.message || 'Nieprawidłowa wartość').join(', ')}
                </FieldDescription>
              )}
            </Field>
          )}
        </form.Field>
        <form.Field name="confirmPassword">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="confirm-password">Potwierdź hasło</FieldLabel>
              <Input 
                id="confirm-password" 
                type="password" 
                value={field.state.value} 
                onBlur={field.handleBlur} 
                onChange={(e) => field.handleChange(e.target.value)} 
                placeholder="********"
              />
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
            <Field>
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? 'Resetowanie hasła...' : 'Resetuj hasło'}
              </Button>
            </Field>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  )
}
