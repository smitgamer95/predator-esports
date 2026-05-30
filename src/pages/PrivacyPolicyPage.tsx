import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-4xl border-border bg-card">
        <CardHeader>
          <CardTitle className="text-balance text-3xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <p className="text-pretty text-muted-foreground">
            This is a sample Privacy Policy. Please modify this content to reflect your actual privacy practices and comply with applicable laws.
          </p>

          <h2 className="mt-6 text-balance text-xl font-semibold text-foreground">Information We Collect</h2>
          <p className="text-pretty text-muted-foreground">
            We collect information you provide directly to us, including your name, email address, phone number, game name, and game UID when you register for tournaments.
          </p>

          <h2 className="mt-6 text-balance text-xl font-semibold text-foreground">How We Use Your Information</h2>
          <p className="text-pretty text-muted-foreground">
            We use the information we collect to operate and improve our services, process tournament registrations, verify payments, and communicate with you about tournaments and results.
          </p>

          <h2 className="mt-6 text-balance text-xl font-semibold text-foreground">Data Security</h2>
          <p className="text-pretty text-muted-foreground">
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2 className="mt-6 text-balance text-xl font-semibold text-foreground">Contact Us</h2>
          <p className="text-pretty text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us at admin@predator.com.
          </p>

          <p className="mt-6 text-sm text-destructive">
            <strong>Important:</strong> This is a sample privacy policy. Please consult with a legal professional to create a proper privacy policy that complies with applicable laws and regulations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
