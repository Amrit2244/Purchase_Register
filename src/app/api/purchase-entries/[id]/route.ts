import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PurchaseEntry from '@/models/PurchaseEntry';
import Party from '@/models/Party'; // Required for population
import Item from '@/models/Item'; // Required for population

// Ensure models are initialized for population
Party.init();
Item.init();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }

    const entry = await PurchaseEntry.findById(id)
      .populate('party', 'name')
      .populate('item', 'name');

    if (!entry) {
      return NextResponse.json({ message: 'Purchase entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching purchase entry:', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error fetching purchase entry', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const updatedData = await request.json();

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }
    
    // Ensure date is correctly formatted if provided
    if (updatedData.date) {
      updatedData.date = new Date(updatedData.date);
    }


    const entry = await PurchaseEntry.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    )
    .populate('party', 'name')
    .populate('item', 'name');

    if (!entry) {
      return NextResponse.json({ message: 'Purchase entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry, { status: 200 });
  } catch (error: any) {
    console.error('Error updating purchase entry:', error);
    if (error.name === 'ValidationError') {
      // Extracting specific validation messages could be done here
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    if (error.name === 'CastError') {
      return NextResponse.json({ message: 'Invalid ID format or data type mismatch' }, { status: 400 });
    }
    // Catch duplicate key error for fields with unique index
    if (error.code === 11000 && error.keyValue) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      let userMessage = `The value '${value}' for '${field}' already exists. Please use a different value.`;

      if (field === 'serialNumber') {
        userMessage = `Serial number '${value}' is already in use by another entry.`;
      } else if (field === 'transitPassNo') {
        userMessage = `Transit Pass Number '${value}' is already in use by another entry.`;
      } else if (field === 'originFormJNo') {
        userMessage = `Origin Form J Number '${value}' is already in use by another entry.`;
      }
      // Add more specific messages for other unique fields if necessary

      return NextResponse.json({ message: userMessage, field: field, value: value }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error updating purchase entry', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }

    const deletedEntry = await PurchaseEntry.findByIdAndDelete(id);

    if (!deletedEntry) {
      return NextResponse.json({ message: 'Purchase entry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Purchase entry deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting purchase entry:', error);
    if (error.name === 'CastError') {
      // This specific check might be redundant if the regex check for ID format is robust
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error deleting purchase entry', error: error.message }, { status: 500 });
  }
}
