import { NextResponse } from "next/server";
import { PrismaClient, AccountCreateInput } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Function to generate a random 12-digit account number
const generateAccountNumber = () => {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

export async function POST(req: Request) {
  const { userName, email, password } = await req.json();

  // Validate input (you can add more checks)
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Check if the email is already in use
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Email is already registered" },
      { status: 400 }
    );
  }

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Create the user in the database with the email as name
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: userName,  
      },
    });

    // Generate Account Numbers
    const checkingAccountNumber = generateAccountNumber();
    const savingsAccountNumber = generateAccountNumber();

    // Create Checkings & Savings Account with $1000 Each
    await prisma.account.create({
      data: {
        userId: user.id,
        accountType: "checking",
        accountNumber: checkingAccountNumber,  // Now required
        balance: 1000.00,
      } as AccountCreateInput,  // Cast to AccountCreateInput
    });

    // Create Savings Account with $1000
    await prisma.account.create({
      data: {
        userId: user.id,
        accountType: "savings",
        accountNumber: savingsAccountNumber,  // Now required
        balance: 1000.00,
      } as AccountCreateInput,  // Cast to AccountCreateInput
    });

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while creating the user" },
      { status: 500 }
    );
  }
}
