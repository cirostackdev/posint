"use client"

import { Building2, ExternalLink, Globe, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import type { ContactInfo } from "../api/politicians.types"

interface ContactCardProps {
  contacts: ContactInfo | null | undefined
}

export function ContactCard({ contacts }: ContactCardProps) {
  const hasContact =
    contacts &&
    (contacts.email || contacts.phone || contacts.website || contacts.twitterHandle || contacts.officeAddress)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasContact && (
          <p className="text-sm text-muted-foreground">No contact information available.</p>
        )}
        {contacts?.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a href={`mailto:${contacts.email}`} className="text-primary hover:underline truncate">
              {contacts.email}
            </a>
          </div>
        )}
        {contacts?.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{contacts.phone}</span>
          </div>
        )}
        {contacts?.officeAddress && (
          <div className="flex items-start gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{contacts.officeAddress}</span>
          </div>
        )}
        {contacts?.website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a
              href={contacts.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Website <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
        {contacts?.twitterHandle && (
          <div className="flex items-center gap-2 text-sm">
            <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <a
              href={`https://twitter.com/${contacts.twitterHandle.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              {contacts.twitterHandle} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
