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

    // Also keep the combined check for extra security
    const existingEntry = await PurchaseEntry.findOne({
      transitPassNo: transitPassNo,
      originFormJNo: originFormJNo
    });

    if (existingEntry) {
      return NextResponse.json(
        { 
          message: 'Duplicate entry not allowed',
          error: 'An entry with this Transit Pass Number and Origin Form J Number already exists.' 
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
    if (error.code === 11000) {
      // Check which field caused the duplicate key error
      const keyPattern = error.keyPattern || {};
      
      if (keyPattern.transitPassNo) {
        return NextResponse.json(
          { 
            message: 'Duplicate entry not allowed',
            error: 'This Transit Pass Number is already in use.' 
          },
          { status: 400 }
        );
      } else if (keyPattern.originFormJNo) {
        return NextResponse.json(
          { 
            message: 'Duplicate entry not allowed',
            error: 'This Origin Form J Number is already in use.' 
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { 
            message: 'Duplicate entry not allowed',
            error: 'A duplicate entry was detected.' 
          },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { message: 'Error creating purchase entry' },
      { status: 500 }
    );
  }
}