
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Welcome Back to Wellspring</CardTitle>
          <CardDescription>This is a placeholder for the sign-in form.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-8 border border-dashed rounded-md">
            <p className="text-muted-foreground">Sign-in form will be implemented here.</p>
             <p className="text-muted-foreground mt-2">This includes email and password fields.</p>
          </div>
          <Button type="submit" className="w-full" disabled>
            Sign In (Coming Soon)
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/register">
                Get Started
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
