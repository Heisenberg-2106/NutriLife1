import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import clientPromise from "@/lib/mongodb";

// Validate environment variables at startup
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set in environment variables");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "example@email.com"
        },
        password: { 
          label: "Password", 
          type: "password" 
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          throw new Error("Email and password are required");
        }
      
        try {
          console.log("Attempting login for:", credentials.email.toLowerCase());
          const client = await clientPromise;
          const db = client.db();
          const user = await db.collection("users").findOne({ 
            email: credentials.email.toLowerCase()
          });
      
          console.log("Found user:", user ? { 
            email: user.email, 
            hasPassword: !!user.password 
          } : null);
      
          if (!user || !user.password) {
            console.log("User not found or has no password");
            throw new Error("Invalid credentials");
          }
      
          console.log("Comparing passwords...");
          const passwordMatch = await compare(credentials.password, user.password);
          console.log("Password match:", passwordMatch);
      
          if (!passwordMatch) {
            throw new Error("Invalid credentials");
          }
      
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || "",
            role: user.role || "user"
          };
        } catch (error) {
          console.error("Authentication error details:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/",
    newUser: "/register" // Optional: Add if you have registration
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Enhanced type extensions
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role?: string;
  }
}