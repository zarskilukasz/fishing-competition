"use client"

import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { LoginSchema, type LoginInput } from "../schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient()

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
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
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <form.Field
        name="email"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Email</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="name@example.com"
              type="email"
            />
            {field.state.meta.errors ? (
              <p className="text-sm font-medium text-destructive">
                {field.state.meta.errors.join(", ")}
              </p>
            ) : null}
          </div>
        )}
      />

      <form.Field
        name="password"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Hasło</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="******"
              type="password"
            />
            {field.state.meta.errors ? (
              <p className="text-sm font-medium text-destructive">
                {field.state.meta.errors.join(", ")}
              </p>
            ) : null}
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button className="w-full" type="submit" disabled={!canSubmit}>
            {isSubmitting ? "Logowanie..." : "Zaloguj się"}
          </Button>
        )}
      />
    </form>
  )
}
