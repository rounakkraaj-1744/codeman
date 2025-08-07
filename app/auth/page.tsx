"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Github } from "lucide-react"
import GoogleSvg from "@/assets/svg/google-svg"
import {signIn} from "next-auth/react"

export default function AuthTabs() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6 mx-auto mt-12 mb-12">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        {/* LOGIN */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Access your account securely.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="you@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" placeholder="••••••••" />
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* OAUTH BELOW FORM */}
              <div className="grid gap-3">
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Continue with Email
                </Button>
                <Button variant="outline" className="w-full" onClick={()=> signIn("google")}>
                  <GoogleSvg/>
                  Continue with Google
                </Button>
                <Button variant="outline" className="w-full" onClick={()=> signIn("github")}>
                  <Github/>
                  Continue with GitHub
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full">Login</Button>
              <Button variant="link" className="text-sm text-muted-foreground px-0">
                Forgot password?
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SIGNUP */}
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>Sign up to get started!</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input id="signup-name" type="text" placeholder="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="you@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" placeholder="Create a strong password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input id="signup-confirm" type="password" placeholder="Re-enter your password" />
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* OAUTH BELOW FORM */}
              <div className="grid gap-3">
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Continue with Email
                </Button>
                <Button variant="outline" className="w-full">
                  <GoogleSvg/>
                  Continue with Google
                </Button>
                <Button variant="outline" className="w-full">
                  <Github/>
                  Continue with GitHub
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Create Account</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
