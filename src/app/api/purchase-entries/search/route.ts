import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PurchaseEntry from '@/models/PurchaseEntry';
import Party from '@/models/Party'; // Required for population
import Item from '@/models/Item'; // Required for population

// Ensure models are initialized for population
Party.init();
Item.init();

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const transitPassNo = searchParams.get('transitPassNo');
    const vehicleNo = searchParams.get('vehicleNo');
    const ostpNo = searchParams.get('ostpNo'); // This will be mapped to originFormJNo

    const query: any = {};

    if (transitPassNo) {
      // Case-insensitive search for transitPassNo
      query.transitPassNo = new RegExp(transitPassNo, 'i');
    }
    if (vehicleNo) {
      // Case-insensitive search for vehicleNumber
      query.vehicleNumber = new RegExp(vehicleNo, 'i');
    }
    if (ostpNo) {
      // Case-insensitive search for originFormJNo
      query.originFormJNo = new RegExp(ostpNo, 'i');
    }

    // Check if any search parameters were provided
    if (Object.keys(query).length === 0) {
      return NextResponse.json(
        { message: 'Please provide at least one search parameter (transitPassNo, vehicleNo, or ostpNo).' },
        { status: 400 }
      );
    }

    // Execute the query with filters
    const entries = await PurchaseEntry.find(query)
      .populate('party', 'name') // Populate party name
      .populate('item', 'name')   // Populate item name
      .sort({ date: -1, serialNumber: -1 }); // Sort by date descending, then serialNumber descending

    return NextResponse.json(entries, { status: 200 });

  } catch (error: any) {
    console.error('Error searching purchase entries:', error);
    return NextResponse.json(
      { message: 'Error searching purchase entries', error: error.message },
      { status: 500 }
    );
  }
}
