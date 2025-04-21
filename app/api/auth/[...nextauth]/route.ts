// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server"; // Import for Next.js 13
import { NextApiRequest, NextApiResponse } from "next"; // Import for compatibility with NextAuth

// Initialize Prisma Client
const prisma = new PrismaClient();

// Explicitly type `authOptions` to match `NextAuthOptions`
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
          },
        });

        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return user;  // Return user if credentials are valid
        } else {
          return null;  // Invalid credentials
        }
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),  // Prisma adapter for session management
  session: {
    strategy: "jwt" as const,  // Explicitly type the session strategy
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;  // Return the token with user info
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      console.log('Session after setting', session)
      return session;  // Return the session with user info
    },
  },
};

// Correct the handler to use NextApiRequest and NextApiResponse
export const POST = async (req: NextRequest, res: NextResponse) => {
  const apiReq = req as unknown as NextApiRequest;  // Cast to NextApiRequest
  const apiRes = res as unknown as NextApiResponse; // Cast to NextApiResponse

  return NextAuth(apiReq, apiRes, authOptions);  // Use all three arguments
};

// Manually handle the GET method for the session route
export const GET = async (req: NextRequest, res: NextResponse) => {
  const apiReq = req as unknown as NextApiRequest;
  const apiRes = res as unknown as NextApiResponse;

  return NextAuth(apiReq, apiRes, authOptions);  // Handle the GET request
};
