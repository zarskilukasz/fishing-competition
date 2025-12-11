"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "@tanstack/react-form"
import { LoginSchema, type LoginInput } from "@/src/features/auth/schemas"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const supabase = createClient()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    } as LoginInput,
    validators: {
      onChange: LoginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: value.email,
          password: value.password,
        })

        if (error) {
          toast.error("Błąd logowania", {
            description: error.message,
          })
          return
        }

        toast.success("Zalogowano pomyślnie")
        router.push("/dashboard")
        router.refresh()
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
          <h1 className="text-2xl font-bold">Zaloguj się do swojego konta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Wprowadź swój email poniżej, aby się zalogować
          </p>
        </div>
        <form.Field name="email">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="email">Adres email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors && (
                <FieldDescription className="text-red-500">
                  {field.state.meta.errors.map(error => error?.message || 'Nieprawidłowa wartość').join(', ')}
                </FieldDescription>
              )}
            </Field>
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Hasło</FieldLabel>
                <a
                  href="/auth/forgot-password"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Zapomniałeś hasła?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
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
                {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
              </Button>
            </Field>
          )}
        </form.Subscribe>
        <FieldSeparator />
        <Field>
          <FieldDescription className="text-center">
            Nie masz konta?{" "}
            <a href="/auth/register" className="underline underline-offset-4">
              Zarejestruj się
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
