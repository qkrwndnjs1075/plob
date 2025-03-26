"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"
import type { AuthUser } from "./types"

// Types
type AuthContextType = {
  user: AuthUser | null
  loading: boolean
  demoMode: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const isDemoMode = !supabaseUrl || !supabaseAnonKey

// Create a mock user for demo mode
const mockUser: AuthUser = {
  id: "demo-user-id",
  email: "demo@example.com",
  displayName: "Demo User",
  photoURL: "/placeholder.svg?height=40&width=40",
}

// Create the Supabase client or a mock implementation
const supabase = !isDemoMode && typeof window !== "undefined" ? createClient(supabaseUrl!, supabaseAnonKey!) : null

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const isMounted = useRef(true)

  // Set up cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    // If in demo mode, set a mock user after a short delay to simulate loading
    if (isDemoMode) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setLoading(false)
          // Initially set to null to simulate logged out state
          setUser(null)

          toast({
            title: "Demo Mode Active",
            description:
              "This app is running in demo mode without Supabase credentials. Authentication features are simulated.",
          })
        }
      }, 1000)

      return () => {
        clearTimeout(timer)
      }
    }

    // Real Supabase authentication logic
    if (supabase) {
      // Check for active session on mount
      const checkSession = async () => {
        try {
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error("Error checking session:", error)
            if (isMounted.current) {
              setLoading(false)
            }
            return
          }

          if (data.session && isMounted.current) {
            const userData = data.session.user
            setUser({
              id: userData.id,
              email: userData.email,
              displayName: userData.user_metadata?.full_name,
              photoURL: userData.user_metadata?.avatar_url,
            })
          }
        } catch (error) {
          console.error("Failed to check session:", error)
        } finally {
          if (isMounted.current) {
            setLoading(false)
          }
        }
      }

      checkSession()

      // Set up auth state change listener
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && isMounted.current) {
          const userData = session.user
          setUser({
            id: userData.id,
            email: userData.email,
            displayName: userData.user_metadata?.full_name,
            photoURL: userData.user_metadata?.avatar_url,
          })
        } else if (isMounted.current) {
          setUser(null)
        }
      })

      return () => {
        authListener.subscription.unsubscribe()
      }
    }
  }, [toast])

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (isDemoMode) {
      // Simulate Google sign in for demo mode
      setLoading(true)
      setTimeout(() => {
        if (isMounted.current) {
          setUser(mockUser)
          setLoading(false)
          toast({
            title: "Demo Sign In",
            description: "You are now signed in as a demo user via Google.",
          })
        }
      }, 1000)
      return
    }

    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          throw error
        }
      } catch (error: any) {
        if (isMounted.current) {
          toast({
            title: "Error signing in with Google",
            description: error.message,
            variant: "destructive",
          })
        }
      }
    }
  }

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    if (isDemoMode) {
      // Simulate email sign in for demo mode
      setLoading(true)
      setTimeout(() => {
        if (isMounted.current) {
          if (email === "demo@example.com" && password === "password") {
            setUser(mockUser)
            toast({
              title: "Welcome back!",
              description: "You have successfully signed in.",
            })
          } else {
            toast({
              title: "Demo Sign In",
              description: "In demo mode, use demo@example.com / password to sign in.",
              variant: "destructive",
            })
          }
          setLoading(false)
        }
      }, 1000)
      return
    }

    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        if (isMounted.current) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          })
        }
      } catch (error: any) {
        if (isMounted.current) {
          toast({
            title: "Error signing in",
            description: error.message,
            variant: "destructive",
          })
        }
      }
    }
  }

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string) => {
    if (isDemoMode) {
      // Simulate email sign up for demo mode
      setLoading(true)
      setTimeout(() => {
        if (isMounted.current) {
          toast({
            title: "Demo Account Created",
            description:
              "In demo mode, account creation is simulated. Please use demo@example.com / password to sign in.",
          })
          setLoading(false)
        }
      }, 1000)
      return
    }

    if (supabase) {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          throw error
        }

        if (isMounted.current) {
          toast({
            title: "Account created",
            description: "Please check your email to confirm your account.",
          })
        }
      } catch (error: any) {
        if (isMounted.current) {
          toast({
            title: "Error creating account",
            description: error.message,
            variant: "destructive",
          })
        }
      }
    }
  }

  // Sign out
  const signOut = async () => {
    if (isDemoMode) {
      // Simulate sign out for demo mode
      setLoading(true)
      setTimeout(() => {
        if (isMounted.current) {
          setUser(null)
          setLoading(false)
          toast({
            title: "Signed out",
            description: "You have been successfully signed out.",
          })
        }
      }, 500)
      return
    }

    if (supabase) {
      try {
        const { error } = await supabase.auth.signOut()

        if (error) {
          throw error
        }

        if (isMounted.current) {
          toast({
            title: "Signed out",
            description: "You have been successfully signed out.",
          })
        }
      } catch (error: any) {
        if (isMounted.current) {
          toast({
            title: "Error signing out",
            description: error.message,
            variant: "destructive",
          })
        }
      }
    }
  }

  const value = {
    user,
    loading,
    demoMode: isDemoMode,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

