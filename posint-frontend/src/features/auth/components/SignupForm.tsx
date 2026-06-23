"use client"

import Link from "next/link"
import { Shield, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useSignupForm } from "../hooks/use-auth"

export function SignupForm() {
  const { form, onSubmit, isLoading } = useSignupForm()
  const { register, handleSubmit, formState: { errors } } = form

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur border-border/50 shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground">
          Join POSINT — Nigerian Political Intelligence
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-foreground">Display name <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              className="bg-background/50 border-border/60 focus:border-primary"
              {...register("displayName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="bg-background/50 border-border/60 focus:border-primary"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className="bg-background/50 border-border/60 focus:border-primary"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
