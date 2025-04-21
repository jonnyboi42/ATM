import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // Ensure this path is correct
import { PrismaClient } from "@prisma/client";

// Instantiate Prisma client
const prisma = new PrismaClient();

// GET accounts route
export const GET = async (req: NextRequest) => {
  try {
    // Convert NextRequest to NextApiRequest for compatibility with getServerSession
    const session = await getServerSession({ req, ...authOptions });

    // If the session does not exist (i.e., the user is not authenticated)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch accounts for the authenticated user
    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id, // Assuming the account table has a userId reference
      },
    });

    // Return the accounts as a response
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
};
