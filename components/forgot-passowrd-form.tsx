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
import { ForgotPasswordSchema, type ForgotPasswordInput } from "@/src/features/auth/schemas"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [emailSent, setEmailSent] = useState(false)
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)
  const supabase = createClient()

  const form = useForm({
    defaultValues: {
      email: '',
    } as ForgotPasswordInput,
    validators: {
      onChange: ForgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // Clear any previous rate limit error
        setRateLimitError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(value.email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        if (error) {
          // Handle rate limit error specifically
          if (error.message?.includes("over_email_send_rate_limit") || error.code === "over_email_send_rate_limit") {
            // Extract wait time from error message (e.g., "39 seconds")
            const waitTimeMatch = error.message.match(/(\d+)\s+seconds/)
            const waitTime = waitTimeMatch ? waitTimeMatch[1] : "60"

            setRateLimitError(`Musisz poczekać ${waitTime} sekund przed wysłaniem kolejnego żądania resetowania hasła.`)
            return
          }

          toast.error("Błąd wysyłania emaila", {
            description: error.message,
          })
          return
        }

        setEmailSent(true)
        toast.success("Email wysłany", {
          description: "Sprawdź swoją skrzynkę email, aby zresetować hasło.",
        })
      } catch (error) {
        console.error(error)
        toast.error("Wystąpił nieoczekiwany błąd")
      }
    },
  })

  if (emailSent) {
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
            <h1 className="text-2xl font-bold">Link resetujący został wysłany!</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Sprawdź swoją skrzynkę email i kliknij w link, aby zresetować hasło.
              Jeśli nie widzisz wiadomości, sprawdź folder spam.
            </p>
          </div>
          <FieldSeparator />
          <Field>
            <FieldDescription className="text-center">
              <button
                onClick={() => setEmailSent(false)}
                className="underline underline-offset-4 hover:text-primary"
              >
                Wyślij ponownie
              </button>
              {" | "}
              <a href="/auth/login" className="underline underline-offset-4">
                Powrót do logowania
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
          <h1 className="text-2xl font-bold">Zapomniałeś hasła?</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Wprowadź swój email poniżej, aby zresetować hasło
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
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  // Clear rate limit error when user starts typing
                  if (rateLimitError) {
                    setRateLimitError(null)
                  }
                }}
              />
              {field.state.meta.errors && (
                <FieldDescription className="text-red-500">
                  {field.state.meta.errors.map(error => error?.message || 'Nieprawidłowa wartość').join(', ')}
                </FieldDescription>
              )}
              {rateLimitError && (
                <FieldDescription className="text-orange-600 font-medium">
                  {rateLimitError}
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
        <FieldSeparator />
        <Field>
          <FieldDescription className="text-center">
            Pamiętasz hasło?{" "}
            <a href="/auth/login" className="underline underline-offset-4">
              Zaloguj się
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
