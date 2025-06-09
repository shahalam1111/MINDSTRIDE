
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Create Your Wellspring Account</CardTitle>
          <CardDescription>This is a placeholder for the registration form.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-8 border border-dashed rounded-md">
            <p className="text-muted-foreground">Registration form will be implemented here.</p>
            <p className="text-muted-foreground mt-2">This includes email, password, age verification, and terms acceptance.</p>
          </div>
          <Button type="submit" className="w-full" disabled>
            Register (Coming Soon)
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
