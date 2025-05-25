'use client';

import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Party {
  _id: string;
  name: string;
}

interface Item {
  _id: string;
  name: string;
}

interface PurchaseEntry {
  _id: string;
  serialNumber: number;
  date: string; // Keep as string for input, convert on submission
  vehicleNumber: string;
  party: Party | string; // Can be object when populated, string for ID
  item: Item | string;   // Can be object when populated, string for ID
  transitPassNo: string;
  quantity: number;
  originFormJNo?: string; // Optional
  // Add any other fields from your schema that need to be edited
}

const EditEntryPage = () => {
  // Search state
  const [searchParams, setSearchParams] = useState({
    transitPassNo: '',
    vehicleNo: '',
    ostpNo: '',
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<PurchaseEntry[]>([]);
  const [noResultsFound, setNoResultsFound] = useState(false);

  // Edit form state
  const [selectedEntry, setSelectedEntry] = useState<PurchaseEntry | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Data for dropdowns
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // Fetch parties and items for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partiesRes, itemsRes] = await Promise.all([
          fetch('/api/parties'),
          fetch('/api/items'),
        ]);
        if (!partiesRes.ok || !itemsRes.ok) {
          throw new Error('Failed to fetch parties or items');
        }
        const partiesData = await partiesRes.json();
        const itemsData = await itemsRes.json();
        setParties(partiesData);
        setItems(itemsData);
      } catch (error) {
        console.error('Error fetching parties/items:', error);
        toast.error('Could not load parties or items for dropdowns.');
      }
    };
    fetchData();
  }, []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
    // Clear other search fields when one is typed into
    Object.keys(searchParams).forEach(key => {
      if (key !== name) {
        setSearchParams(prev => ({ ...prev, [key]: '' }));
      }
    });
  };
  
  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError(null);
    setSelectedEntry(null);
    setSearchResults([]);
    setNoResultsFound(false);

    let query = '';
    if (searchParams.transitPassNo) {
      query = `transitPassNo=${encodeURIComponent(searchParams.transitPassNo)}`;
    } else if (searchParams.vehicleNo) {
      query = `vehicleNo=${encodeURIComponent(searchParams.vehicleNo)}`;
    } else if (searchParams.ostpNo) {
      query = `ostpNo=${encodeURIComponent(searchParams.ostpNo)}`;
    } else {
      setSearchError('Please enter a search term in one of the fields.');
      setSearchLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/purchase-entries/search?${query}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      const data: PurchaseEntry[] = await response.json();
      if (data.length === 0) {
        setNoResultsFound(true);
      } else if (data.length === 1) {
        // Format date for input type="date" which expects YYYY-MM-DD
        const entry = data[0];
        if (entry.date) {
            entry.date = new Date(entry.date).toISOString().split('T')[0];
        }
        setSelectedEntry(entry);
      } else {
        setSearchResults(data); // Handle multiple results
      }
    } catch (error: any) {
      setSearchError(error.message);
      toast.error(`Search failed: ${error.message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectEntryFromList = (entry: PurchaseEntry) => {
    if (entry.date) {
        entry.date = new Date(entry.date).toISOString().split('T')[0];
    }
    setSelectedEntry(entry);
    setSearchResults([]); // Clear search results list
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!selectedEntry) return;
    const { name, value } = e.target;

    // Handle nested properties for party and item if they are objects
    if (name === "party" || name === "item") {
        setSelectedEntry(prev => prev ? { ...prev, [name]: value } : null);
    } else {
        setSelectedEntry(prev => prev ? { ...prev, [name]: value } : null);
    }
  };
  

  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    setUpdateLoading(true);
    setUpdateError(null);

    // Basic client-side validation
    if (!selectedEntry.serialNumber || !selectedEntry.date || !selectedEntry.vehicleNumber || !selectedEntry.party || !selectedEntry.item || !selectedEntry.transitPassNo || selectedEntry.quantity == null) {
      toast.error('Please fill all required fields.');
      setUpdateLoading(false);
      return;
    }
    
    // Ensure party and item are just IDs if they are objects
    const payload = {
        ...selectedEntry,
        party: typeof selectedEntry.party === 'object' ? selectedEntry.party._id : selectedEntry.party,
        item: typeof selectedEntry.item === 'object' ? selectedEntry.item._id : selectedEntry.item,
    };

    try {
      const response = await fetch(`/api/purchase-entries/${selectedEntry._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Error: ${response.status}`);
      }
      
      toast.success('Purchase entry updated successfully!');
      // Optionally, clear form or re-fetch:
      // setSelectedEntry(null); 
      // Or update selectedEntry with responseData if it's the updated object
      if (responseData.date) {
        responseData.date = new Date(responseData.date).toISOString().split('T')[0];
      }
      setSelectedEntry(responseData);

    } catch (error: any) {
      setUpdateError(error.message);
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-700 mb-8 text-center">Edit Purchase Entry</h1>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Search Entry</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="transitPassNo" className="block text-sm font-medium text-gray-700 mb-1">Transit Pass No.</label>
              <input
                type="text"
                name="transitPassNo"
                id="transitPassNo"
                value={searchParams.transitPassNo}
                onChange={handleSearchInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter Transit Pass No."
              />
            </div>
            <div>
              <label htmlFor="vehicleNo" className="block text-sm font-medium text-gray-700 mb-1">Vehicle No.</label>
              <input
                type="text"
                name="vehicleNo"
                id="vehicleNo"
                value={searchParams.vehicleNo}
                onChange={handleSearchInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter Vehicle No."
              />
            </div>
            <div>
              <label htmlFor="ostpNo" className="block text-sm font-medium text-gray-700 mb-1">OSTP No.</label>
              <input
                type="text"
                name="ostpNo"
                id="ostpNo"
                value={searchParams.ostpNo}
                onChange={handleSearchInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter OSTP No."
              />
            </div>
          </div>
          <div className="text-center">
            <button
              type="submit"
              disabled={searchLoading}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50"
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {searchError && <p className="text-red-500 mt-4 text-center">{searchError}</p>}
        </form>

        {/* Search Results List (if multiple) */}
        {searchResults.length > 0 && !selectedEntry && (
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 mb-10">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Multiple Entries Found - Select One to Edit:</h2>
            <ul className="divide-y divide-gray-200">
              {searchResults.map(entry => (
                <li key={entry._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">TP: {entry.transitPassNo}, Vehicle: {entry.vehicleNumber}, Date: {new Date(entry.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Party: {typeof entry.party === 'object' ? entry.party.name : 'N/A'}, Item: {typeof entry.item === 'object' ? entry.item.name : 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => handleSelectEntryFromList(entry)}
                    className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition duration-150"
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}


        {noResultsFound && !selectedEntry && (
          <div className="text-center py-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No entry found</h3>
            <p className="mt-1 text-sm text-gray-500">No purchase entry matches your search criteria.</p>
          </div>
        )}

        {/* Edit Form */}
        {selectedEntry && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleUpdateSubmit}
            className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 border-b pb-4">Edit Details for Entry</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                <input type="number" name="serialNumber" id="serialNumber" value={selectedEntry.serialNumber} onChange={handleEditFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" name="date" id="date" value={selectedEntry.date} onChange={handleEditFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                <input type="text" name="vehicleNumber" id="vehicleNumber" value={selectedEntry.vehicleNumber} onChange={handleEditFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="party" className="block text-sm font-medium text-gray-700 mb-1">Party</label>
                <select name="party" id="party" value={typeof selectedEntry.party === 'object' ? selectedEntry.party._id : selectedEntry.party} onChange={handleEditFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Select Party</option>
                  {parties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="item" className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                <select name="item" id="item" value={typeof selectedEntry.item === 'object' ? selectedEntry.item._id : selectedEntry.item} onChange={handleEditFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Select Item</option>
                  {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="transitPassNo" className="block text-sm font-medium text-gray-700 mb-1">Transit Pass No.</label>
                <input type="text" name="transitPassNo" id="transitPassNo" value={selectedEntry.transitPassNo} onChange={handleEditFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity (Quintals)</label>
                <input type="number" step="0.01" name="quantity" id="quantity" value={selectedEntry.quantity} onChange={handleEditFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="originFormJNo" className="block text-sm font-medium text-gray-700 mb-1">Origin Form J No. (Optional)</label>
                <input type="text" name="originFormJNo" id="originFormJNo" value={selectedEntry.originFormJNo || ''} onChange={handleEditFormChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                type="submit"
                disabled={updateLoading}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50"
              >
                {updateLoading ? 'Updating...' : 'Update Entry'}
              </button>
            </div>
            {updateError && <p className="text-red-500 mt-4 text-center">{updateError}</p>}
          </motion.form>
        )}
      </div>
    </motion.div>
  );
};

export default EditEntryPage;
