"use client"

import { useState } from "react"
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
import { RegisterSchema, type RegisterInput } from "@/src/features/auth/schemas"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const supabase = createClient()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    } as RegisterInput,
    validators: {
      onChange: RegisterSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { error } = await supabase.auth.signUp({
          email: value.email,
          password: value.password,
        })

        if (error) {
          toast.error("Błąd rejestracji", {
            description: error.message,
          })
          return
        }

        setRegistrationSuccess(true)
        toast.success("Konto zostało utworzone", {
          description: "Sprawdź swoją skrzynkę email, aby potwierdzić konto.",
        })
      } catch (error) {
        console.error(error)
        toast.error("Wystąpił nieoczekiwany błąd")
      }
    },
  })

  if (registrationSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Konto zostało utworzone!</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Sprawdź swoją skrzynkę email i kliknij w link potwierdzający,
              aby aktywować konto. Jeśli nie widzisz wiadomości, sprawdź folder spam.
            </p>
          </div>
          <FieldSeparator />
          <Field>
            <FieldDescription className="text-center">
              <a href="/login" className="underline underline-offset-4">
                Przejdź do logowania
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </div>
    )
  }

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
          <h1 className="text-2xl font-bold">Utwórz konto</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Wypełnij formularz poniżej, aby utworzyć konto
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
              <FieldDescription>
                Użyjemy tego do kontaktu. Nie udostępnimy Twojego adresu email nikomu.
              </FieldDescription>
            </Field>
          )}
        </form.Field>
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
              <FieldDescription>
                Musi mieć minimum 8 znaków.
              </FieldDescription>
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
              <FieldDescription>Potwierdź swoje hasło.</FieldDescription>
            </Field>
          )}
        </form.Field>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Field>
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? 'Tworzenie konta...' : 'Utwórz konto'}
              </Button>
            </Field>
          )}
        </form.Subscribe>
        <FieldSeparator/>
        <Field>
          <FieldDescription className="text-center">
            Masz już konto?{" "}
            <a href="/login" className="underline underline-offset-4">
              Zaloguj się
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
