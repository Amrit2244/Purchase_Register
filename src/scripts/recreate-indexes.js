// Migration script to rebuild indexes for the PurchaseEntry collection
// This ensures unique constraints are properly applied

const { MongoClient } = require('mongodb');

async function recreateIndexes() {
  // Replace with your MongoDB connection string
  const uri = 'mongodb://localhost:27017/purchase_register';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('purchase_register');
    const purchaseEntries = db.collection('purchaseentries');

    // Drop all existing indexes except the _id index
    console.log('Dropping existing indexes...');
    const indexes = await purchaseEntries.indexes();
    for (const index of indexes) {
      if (index.name !== '_id_') {
        await purchaseEntries.dropIndex(index.name);
        console.log(`Dropped index: ${index.name}`);
      }
    }

    // Recreate the indexes
    console.log('Creating new indexes...');

    // Create unique index for serialNumber
    await purchaseEntries.createIndex(
      { serialNumber: 1 },
      { unique: true, name: 'unique_serial_number' }
    );
    console.log('Created unique index for serialNumber');

    // Create unique index for transitPassNo
    await purchaseEntries.createIndex(
      { transitPassNo: 1 },
      { unique: true, name: 'unique_transit_pass' }
    );
    console.log('Created unique index for transitPassNo');

    // Create unique index for originFormJNo
    await purchaseEntries.createIndex(
      { originFormJNo: 1 },
      { unique: true, name: 'unique_origin_form' }
    );
    console.log('Created unique index for originFormJNo');

    // Create compound unique index
    await purchaseEntries.createIndex(
      { transitPassNo: 1, originFormJNo: 1 },
      { unique: true, name: 'unique_transit_origin' }
    );
    console.log('Created compound unique index for transitPassNo and originFormJNo');

    console.log('All indexes have been recreated successfully');
  } catch (error) {
    console.error('Error recreating indexes:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
recreateIndexes().catch(console.error); 