import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Party from '@/models/Party';

export async function GET() {
  try {
    await connectDB();
    const parties = await Party.find({});
    return NextResponse.json(parties);
  } catch (error) {
    console.error('Error fetching parties:', error);
    return NextResponse.json(
      { message: 'Error fetching parties' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, address, contactNumber } = await request.json();

    await connectDB();

    // Check if party already exists
    const existingParty = await Party.findOne({ name });
    if (existingParty) {
      return NextResponse.json(
        { message: 'Party already exists' },
        { status: 400 }
      );
    }

    const party = await Party.create({
      name,
      address,
      contactNumber,
    });

    return NextResponse.json(
      { message: 'Party created successfully', party },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating party:', error);
    return NextResponse.json(
      { message: 'Error creating party' },
      { status: 500 }
    );
  }
}