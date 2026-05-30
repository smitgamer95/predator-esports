import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-4xl border-border bg-card">
        <CardHeader>
          <CardTitle className="text-balance text-3xl">Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <p className="text-pretty text-muted-foreground">
            This is a sample Terms & Conditions document. Please modify this content to reflect your actual terms and comply with applicable laws.
          </p>

          <h2 className="mt-6 text-balance text-xl font-semibold text-foreground">Acceptance of Terms</h2>
          <p className="text-pretty text-muted-foreground">
            By accessing and using Predator E-Sports platform, you accept and agree to be bound by these Terms and Conditions.
          </p>

          <h2 className="mt-6 text-balance text-xl font-semibold text-foreground">Tournament Registration</h2>
          <p className="text-pretty text-muted-foreground">
            To participate in tournaments, you must register an account and provide accurate information. Entry fees are non-refundable once payment is verified.
          </p>

          <h2 className="mt-6 text-balance text-xl font-semibold text-foreground">User Conduct</h2>
          <p className="text-pretty text-muted-foreground">
            Users must not engage in cheating, harassment, or any behavior that violates fair play principles. Violations may result in disqualification and account suspension.
          </p>

          <h2 className="mt-6 text-balance text-xl font-semibold text-foreground">Payment and Prizes</h2>
          <p className="text-pretty text-muted-foreground">
            All payments must be made through the designated payment methods. Prize distribution will be processed within 7 business days after tournament completion.
          </p>

          <h2 className="mt-6 text-balance text-xl font-semibold text-foreground">Limitation of Liability</h2>
          <p className="text-pretty text-muted-foreground">
            Predator E-Sports is not liable for any technical issues, game server problems, or other circumstances beyond our control that may affect tournament outcomes.
          </p>

          <h2 className="mt-6 text-balance text-xl font-semibold text-foreground">Changes to Terms</h2>
          <p className="text-pretty text-muted-foreground">
            We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of modified terms.
          </p>

          <p className="mt-6 text-sm text-destructive">
            <strong>Important:</strong> This is a sample terms and conditions document. Please consult with a legal professional to create proper terms that comply with applicable laws and regulations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
