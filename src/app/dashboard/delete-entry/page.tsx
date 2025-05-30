'use client';

import { useState, useEffect } from 'react';
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
  date: string;
  vehicleNumber: string;
  party: Party;
  item: Item;
  transitPassNo: string;
  quantity: number;
  originFormJNo: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function DeleteEntryPage() {
  const [entries, setEntries] = useState<PurchaseEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError(null);
      try {
        // Attempting to fetch all entries.
        // The reports endpoint usually requires filters; /api/purchase-entries might be more suitable
        // or /api/purchase-entries/reports?all=true if such a parameter is supported.
        // For now, using a generic endpoint that *should* list entries.
        const response = await fetch('/api/purchase-entries');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch entries' }));
          throw new Error(errorData.message || `Error: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setEntries(data);
        } else if (data && Array.isArray(data.entries)) { // Handling potential nested structure
          setEntries(data.entries);
        }
        else {
          console.warn('Fetched data is not an array:', data);
          setEntries([]); // Default to empty array if structure is unexpected
          // Potentially set an error here as well if data is expected to always be an array
        }
      } catch (err: any) {
        console.error('Error fetching purchase entries:', err);
        setError(err.message || 'An unexpected error occurred.');
        toast.error(err.message || 'Failed to load entries.');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/purchase-entries/${entryId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setEntries(prevEntries => prevEntries.filter(entry => entry._id !== entryId));
          toast.success('Entry deleted successfully!');
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          toast.error(`Failed to delete entry: ${errorData.message || response.statusText}`);
        }
      } catch (err: any) {
        console.error('Error deleting entry:', err);
        toast.error('An error occurred while deleting the entry. Please check the console.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-10">
        Delete Purchase Entries
      </h1>

      {loading && (
        <div className="text-center text-gray-600">
          <p className="text-lg">Loading entries...</p>
          {/* Optional: Add a spinner or more elaborate loading animation here */}
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-xl">No purchase entries found.</p>
          <p className="mt-2">There are currently no entries available to delete.</p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full divide-y divide-gray-300 border border-gray-200 rounded-lg">
            <thead className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
              <tr>
                {[
                  'Serial No',
                  'Date',
                  'Vehicle No',
                  'Party',
                  'Item',
                  'TP No',
                  'Quantity',
                  'Form J No',
                  'Actions', // Added Actions header
                ].map((header) => (
                  <th
                    key={header}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry, index) => (
                <tr key={entry._id} className={`hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {entry.serialNumber?.toString().padStart(2, '0') || 'N/A'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {entry.vehicleNumber || 'N/A'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {entry.party?.name || 'N/A'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {entry.item?.name || 'N/A'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {entry.transitPassNo || 'N/A'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {entry.quantity ?? 'N/A'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {entry.originFormJNo || 'N/A'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-all duration-150 ease-in-out text-xs"
                      title="Delete this entry"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
