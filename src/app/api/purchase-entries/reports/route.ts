import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PurchaseEntry from '@/models/PurchaseEntry';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const party = searchParams.get('party');
    const item = searchParams.get('item');
    
    await connectDB();

    let query: any = {};
    
    // Add filters to query if they exist
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) {
        const fromDateObj = new Date(fromDate);
        fromDateObj.setHours(0, 0, 0, 0);
        query.date.$gte = fromDateObj;
      }
      if (toDate) {
        const toDateObj = new Date(toDate);
        toDateObj.setHours(23, 59, 59, 999);
        query.date.$lte = toDateObj;
      }
    }
    
    if (party) {
      query.party = party;
    }

    if (item) {
      query.item = item;
    }
    
    // Execute the query with filters
    const entries = await PurchaseEntry.find(query)
      .populate('party', 'name')
      .populate('item', 'name')
      .sort({ date: 1, serialNumber: 1 });
      
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching filtered purchase entries:', error);
    return NextResponse.json(
      { message: 'Error fetching filtered purchase entries' },
      { status: 500 }
    );
  }
} 