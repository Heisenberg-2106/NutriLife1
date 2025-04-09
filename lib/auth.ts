import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import clientPromise from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const client = await clientPromise;
          const db = client.db();
          const user = await db.collection("users").findOne({ 
            email: credentials.email.toLowerCase()
          });

          if (!user) {
            throw new Error("User not found");
          }

          const passwordMatch = await compare(credentials.password, user.password);
          if (!passwordMatch) {
            throw new Error("Incorrect password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          } as {
            id: string;
            email: string;
            name: string;
          };
        } catch (error) {
          console.error("Auth error:", error);
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
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/",
  },
  secret: process.env.NEXTAUTH_SECRET!,
  debug: process.env.NODE_ENV === "development",
};

// Extend next-auth types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
  }
}