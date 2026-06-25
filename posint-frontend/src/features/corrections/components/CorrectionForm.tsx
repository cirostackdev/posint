"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Label } from "@/shared/components/ui/label"
import { CheckCircle, AlertCircle } from "lucide-react"
import { apiPost } from "@/shared/lib/api"

interface CorrectionFormProps {
  entityType: string
  entityId: string
  fieldName: string
  currentValue: string
  onSuccess?: () => void
}

interface FormValues {
  proposedValue: string
  evidence: string
  submitterName: string
  submitterEmail: string
}

export function CorrectionForm({
  entityType,
  entityId,
  fieldName,
  currentValue,
  onSuccess,
}: CorrectionFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    setStatus("submitting")
    try {
      await apiPost("/corrections", {
        entityType,
        entityId,
        fieldName,
        currentValue,
        proposedValue: data.proposedValue,
        evidence: data.evidence || undefined,
        submitterName: data.submitterName,
        submitterEmail: data.submitterEmail,
      })
      setStatus("success")
      onSuccess?.()
    } catch (err: any) {
      setStatus("error")
      setErrorMsg(err.message ?? "Failed to submit. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-lg">Correction Submitted</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Your request will be reviewed within 48 hours. Thank you for helping keep POSINT accurate.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Submit a Correction</CardTitle>
        <CardDescription>
          If this information is inaccurate, provide the correct value and your source evidence.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Current value</Label>
            <p className="text-sm mt-1 p-2 bg-muted rounded font-mono break-all">{currentValue}</p>
          </div>

          <div>
            <Label htmlFor="proposedValue">Correct value *</Label>
            <Textarea
              id="proposedValue"
              className="mt-1"
              placeholder="Enter the correct information"
              {...register("proposedValue", { required: "Correct value is required" })}
            />
            {errors.proposedValue && (
              <p className="text-xs text-destructive mt-1">{errors.proposedValue.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="evidence">Source / Evidence</Label>
            <Input
              id="evidence"
              className="mt-1"
              placeholder="URL or description of your source"
              {...register("evidence")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="submitterName">Your name *</Label>
              <Input
                id="submitterName"
                className="mt-1"
                placeholder="Full name"
                {...register("submitterName", { required: "Name is required" })}
              />
              {errors.submitterName && (
                <p className="text-xs text-destructive mt-1">{errors.submitterName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="submitterEmail">Your email *</Label>
              <Input
                id="submitterEmail"
                type="email"
                className="mt-1"
                placeholder="email@example.com"
                {...register("submitterEmail", {
                  required: "Email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                })}
              />
              {errors.submitterEmail && (
                <p className="text-xs text-destructive mt-1">{errors.submitterEmail.message}</p>
              )}
            </div>
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button type="submit" disabled={status === "submitting"} className="w-full">
            {status === "submitting" ? "Submitting..." : "Submit Correction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
