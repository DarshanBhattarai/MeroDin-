import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({ message: "List entries endpoint placeholder" });
}

export async function POST(request: Request) {
  return NextResponse.json({ message: "Create entry endpoint placeholder" });
}
