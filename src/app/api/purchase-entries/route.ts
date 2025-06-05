import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PurchaseEntry from '@/models/PurchaseEntry';

export async function GET() {
  try {
    await connectDB();
    const entries = await PurchaseEntry.find({})
      .populate('party', 'name')
      .populate('item', 'name')
      .sort({ serialNumber: -1 });
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching purchase entries:', error);
    return NextResponse.json(
      { message: 'Error fetching purchase entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      serialNumber,
      date,
      vehicleNumber,
      party,
      item,
      transitPassNo,
      quantity,
      originFormJNo,
    } = await request.json();

    await connectDB();

    // Perform separate checks for both transit pass number and origin form J number
    const existingTransitPass = await PurchaseEntry.findOne({
      transitPassNo: transitPassNo
    });

    if (existingTransitPass) {
      return NextResponse.json(
        { 
          message: 'Duplicate entry not allowed',
          error: `Transit Pass Number "${transitPassNo}" is already in use.` 
        },
        { status: 400 }
      );
    }

    const existingOriginForm = await PurchaseEntry.findOne({
      originFormJNo: originFormJNo
    });

    if (existingOriginForm) {
      return NextResponse.json(
        { 
          message: 'Duplicate entry not allowed',
          error: `Origin Form J Number "${originFormJNo}" is already in use.` 
        },
        { status: 400 }
      );
    }

    // Use the provided serialNumber (as an integer) from the client
    const entry = await PurchaseEntry.create({
      serialNumber: parseInt(serialNumber),
      date,
      vehicleNumber,
      party,
      item,
      transitPassNo,
      quantity: parseInt(quantity),
      originFormJNo,
    });

    return NextResponse.json(
      { message: 'Purchase entry created successfully', entry },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating purchase entry:', error);
    
    // Improve error handling for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors: Record<string, string> = {};
      
      // Extract validation error messages
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: validationErrors
        },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors (MongoDB error code 11000)
    if (error.code === 11000 && error.keyValue) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      let userMessage = `The value '${value}' for field '${field}' already exists. Please use a different value.`;
      // let errorDetail = `A duplicate entry was detected for ${field}: ${value}.`; // This line was in the instructions but seems unused. I'll keep it commented out.

      if (field === 'serialNumber') {
        userMessage = `Serial number '${value}' is already in use. Please refresh the page to get the latest serial number and try again.`;
        // errorDetail = `Serial number '${value}' is already in use.`; // Also seems unused.
      } else if (field === 'transitPassNo') {
        userMessage = `Transit Pass Number '${value}' is already in use.`;
        // errorDetail = `Transit Pass Number '${value}' is already in use.`; // Also seems unused.
      } else if (field === 'originFormJNo') {
        userMessage = `Origin Form J Number '${value}' is already in use.`;
        // errorDetail = `Origin Form J Number '${value}' is already in use.`; // Also seems unused.
      }
      // Add more specific messages for other unique fields if necessary

      return NextResponse.json(
        {
          message: 'Duplicate entry not allowed', // General message for UI category
          error: userMessage, // User-facing detailed message
          field: field, // Field that caused the error
          value: value    // Value that caused the error
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Error creating purchase entry' },
      { status: 500 }
    );
  }
}