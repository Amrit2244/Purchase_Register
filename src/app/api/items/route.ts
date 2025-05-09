import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Item from '@/models/Item';

export async function GET() {
  try {
    await connectDB();
    const items = await Item.find({});
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { message: 'Error fetching items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, unit } = await request.json();

    await connectDB();

    // Check if item already exists
    const existingItem = await Item.findOne({ name });
    if (existingItem) {
      return NextResponse.json(
        { message: 'Item already exists' },
        { status: 400 }
      );
    }

    const item = await Item.create({
      name,
      description,
      unit,
    });

    return NextResponse.json(
      { message: 'Item created successfully', item },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { message: 'Error creating item' },
      { status: 500 }
    );
  }
}