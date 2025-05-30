import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { FC } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: FC<any> | (() => React.JSX.Element);
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    // Redirect to auth page if user is not authenticated
    return (
      <Route path={path}>
        {() => {
          // Use a more direct approach for redirection
          window.location.href = "/auth";
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
              <span className="ml-2">Redirecting to login...</span>
            </div>
          );
        }}
      </Route>
    );
  }

  // Render the protected component if user is authenticated
  return <Route path={path} component={Component} />;
}
