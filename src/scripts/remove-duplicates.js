// Script to clean up duplicate entries in the PurchaseEntry collection
const { MongoClient, ObjectId } = require('mongodb');

async function removeDuplicates() {
  // Replace with your MongoDB connection string
  const uri = 'mongodb://localhost:27017/purchase_register';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('purchase_register');
    const purchaseEntries = db.collection('purchaseentries');

    // Count total entries before cleaning
    const totalBeforeCount = await purchaseEntries.countDocuments();
    console.log(`Total entries before cleaning: ${totalBeforeCount}`);

    // Find duplicate transit pass numbers
    console.log('\nFinding duplicate Transit Pass Numbers...');
    const duplicateTransitPasses = await purchaseEntries.aggregate([
      { $group: { 
          _id: "$transitPassNo", 
          count: { $sum: 1 },
          entries: { $push: { id: "$_id", serialNumber: "$serialNumber" } }
        } 
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    // Remove duplicates keeping only the one with the lowest serial number for each group
    let removedCount = 0;
    if (duplicateTransitPasses.length > 0) {
      console.log(`Found ${duplicateTransitPasses.length} groups of duplicate Transit Pass Numbers.`);
      
      for (const group of duplicateTransitPasses) {
        console.log(`Processing Transit Pass No: ${group._id}`);
        
        // Sort entries by serial number (keep the entry with the lowest serial number)
        group.entries.sort((a, b) => a.serialNumber - b.serialNumber);
        
        // Keep the first entry (lowest serial number), remove the rest
        const entriesToRemove = group.entries.slice(1);
        
        for (const entry of entriesToRemove) {
          console.log(`  Removing duplicate entry with Serial #: ${entry.serialNumber}, ID: ${entry.id}`);
          const result = await purchaseEntries.deleteOne({ _id: new ObjectId(entry.id) });
          if (result.deletedCount === 1) {
            removedCount++;
            console.log(`  ✓ Entry deleted successfully`);
          } else {
            console.log(`  ✗ Failed to delete entry`);
          }
        }
        console.log('---');
      }
    } else {
      console.log('No duplicate Transit Pass Numbers found.');
    }

    // Find duplicate Origin Form J Numbers
    console.log('\nFinding duplicate Origin Form J Numbers...');
    const duplicateOriginForms = await purchaseEntries.aggregate([
      { $group: { 
          _id: "$originFormJNo", 
          count: { $sum: 1 },
          entries: { $push: { id: "$_id", serialNumber: "$serialNumber" } }
        } 
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicateOriginForms.length > 0) {
      console.log(`Found ${duplicateOriginForms.length} groups of duplicate Origin Form J Numbers.`);
      
      for (const group of duplicateOriginForms) {
        console.log(`Processing Origin Form J No: ${group._id}`);
        
        // Sort entries by serial number (keep the entry with the lowest serial number)
        group.entries.sort((a, b) => a.serialNumber - b.serialNumber);
        
        // Keep the first entry (lowest serial number), remove the rest
        const entriesToRemove = group.entries.slice(1);
        
        for (const entry of entriesToRemove) {
          console.log(`  Removing duplicate entry with Serial #: ${entry.serialNumber}, ID: ${entry.id}`);
          const result = await purchaseEntries.deleteOne({ _id: new ObjectId(entry.id) });
          if (result.deletedCount === 1) {
            removedCount++;
            console.log(`  ✓ Entry deleted successfully`);
          } else {
            console.log(`  ✗ Failed to delete entry`);
          }
        }
        console.log('---');
      }
    } else {
      console.log('No duplicate Origin Form J Numbers found.');
    }

    // Count total entries after cleaning
    const totalAfterCount = await purchaseEntries.countDocuments();
    console.log(`\nTotal entries removed: ${removedCount}`);
    console.log(`Total entries after cleaning: ${totalAfterCount}`);

    // Now recreate the indexes
    console.log('\nRecreating indexes to enforce uniqueness...');
    
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

    console.log('\nCleanup complete! Your database should now properly enforce uniqueness constraints.');

  } catch (error) {
    console.error('Error removing duplicates:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the script
removeDuplicates().catch(console.error); 