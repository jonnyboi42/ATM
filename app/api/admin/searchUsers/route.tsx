import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ user, accounts }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/admin/searchUsers:", error);
    return NextResponse.json(
      { error: "An error occurred on the server" },
      { status: 500 }
    );
  }
}
