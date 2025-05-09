// Script to detect duplicate entries in the PurchaseEntry collection
const { MongoClient } = require('mongodb');

async function checkDuplicates() {
  // Replace with your MongoDB connection string
  const uri = 'mongodb://localhost:27017/purchase_register';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('purchase_register');
    const purchaseEntries = db.collection('purchaseentries');

    // Count total entries
    const totalCount = await purchaseEntries.countDocuments();
    console.log(`Total entries in the collection: ${totalCount}`);

    // Find duplicate transit pass numbers
    console.log('\nChecking for duplicate Transit Pass Numbers...');
    const duplicateTransitPasses = await purchaseEntries.aggregate([
      { $group: { 
          _id: "$transitPassNo", 
          count: { $sum: 1 },
          entries: { $push: { id: "$_id", serialNumber: "$serialNumber" } }
        } 
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    if (duplicateTransitPasses.length > 0) {
      console.log(`Found ${duplicateTransitPasses.length} duplicate Transit Pass Numbers:`);
      for (const dup of duplicateTransitPasses) {
        console.log(`Transit Pass No: ${dup._id} appears ${dup.count} times`);
        console.log('Entries with this Transit Pass No:');
        for (const entry of dup.entries) {
          console.log(`- Serial #: ${entry.serialNumber}, ID: ${entry.id}`);
        }
        console.log('---');
      }
    } else {
      console.log('No duplicate Transit Pass Numbers found.');
    }

    // Find duplicate Origin Form J Numbers
    console.log('\nChecking for duplicate Origin Form J Numbers...');
    const duplicateOriginForms = await purchaseEntries.aggregate([
      { $group: { 
          _id: "$originFormJNo", 
          count: { $sum: 1 },
          entries: { $push: { id: "$_id", serialNumber: "$serialNumber" } }
        } 
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    if (duplicateOriginForms.length > 0) {
      console.log(`Found ${duplicateOriginForms.length} duplicate Origin Form J Numbers:`);
      for (const dup of duplicateOriginForms) {
        console.log(`Origin Form J No: ${dup._id} appears ${dup.count} times`);
        console.log('Entries with this Origin Form J No:');
        for (const entry of dup.entries) {
          console.log(`- Serial #: ${entry.serialNumber}, ID: ${entry.id}`);
        }
        console.log('---');
      }
    } else {
      console.log('No duplicate Origin Form J Numbers found.');
    }

  } catch (error) {
    console.error('Error checking for duplicates:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the script
checkDuplicates().catch(console.error); 