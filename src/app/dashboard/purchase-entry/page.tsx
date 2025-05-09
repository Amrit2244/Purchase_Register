'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

interface Party {
  _id: string;
  name: string;
}

interface Item {
  _id: string;
  name: string;
}

export default function PurchaseEntryPage() {
  const { data: session } = useSession();
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [nextSerialNumber, setNextSerialNumber] = useState<number>(1);
  const [formData, setFormData] = useState({
    serialNumber: '',
    date: new Date().toISOString().split('T')[0],
    vehicleNumber: '',
    party: '',
    item: '',
    transitPassNo: '',
    quantity: '',
    originFormJNo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchParties();
    fetchItems();
    fetchNextSerialNumber();
  }, []);
  
  const fetchNextSerialNumber = async () => {
    try {
      const response = await fetch('/api/purchase-entries');
      const data = await response.json();
      
      // If there are entries, get the highest serial number and add 1
      let nextNumber = 1;
      if (data.length > 0) {
        nextNumber = Math.max(...data.map((entry: any) => entry.serialNumber)) + 1;
      }
      
      setNextSerialNumber(nextNumber);
      setFormData(prev => ({
        ...prev,
        serialNumber: nextNumber.toString().padStart(2, '0')
      }));
    } catch (error) {
      console.error('Error fetching next serial number:', error);
    }
  };

  const fetchParties = async () => {
    try {
      const response = await fetch('/api/parties');
      const data = await response.json();
      setParties(data);
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/purchase-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Purchase entry added successfully!');
        
        // Increment serial number for next entry
        const nextNumber = nextSerialNumber + 1;
        setNextSerialNumber(nextNumber);
        
        setFormData({
          serialNumber: nextNumber.toString().padStart(2, '0'),
          date: new Date().toISOString().split('T')[0],
          vehicleNumber: '',
          party: '',
          item: '',
          transitPassNo: '',
          quantity: '',
          originFormJNo: '',
        });
      } else {
        const data = await response.json();
        
        // Check for duplicate entry error
        if (data.message === 'Duplicate entry not allowed') {
          setError(`Duplicate Entry: ${data.error || 'An entry with this Transit Pass Number and Origin Form J Number already exists.'}`);
        } else if (data.errors) {
          // Handle validation errors
          const errorMessages = Object.values(data.errors).join(', ');
          setError(`Validation failed: ${errorMessages}`);
        } else {
          setError(data.message || 'Error adding purchase entry');
        }
      }
    } catch (error) {
      setError('Error adding purchase entry');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Add New Purchase Entry</h2>
            <div className="h-1 w-24 bg-indigo-600 rounded-full"></div>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Serial Number - Full Width */}
            <div className="md:col-span-2 bg-indigo-50 p-6 rounded-xl border-l-4 border-indigo-500">
              <label className="block text-sm font-bold text-indigo-800 mb-2">
                Serial Number
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-indigo-300 bg-indigo-100 text-indigo-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  required
                  pattern="[A-Z]{2}\d{2}[A-Z]{2}\d{4}"
                  title="Vehicle number must follow format like HR55AV3438"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Party
                </label>
                <select
                  name="party"
                  value={formData.party}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                >
                  <option value="">Select Party</option>
                  {parties.map((party) => (
                    <option key={party._id} value={party._id}>
                      {party.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item
                </label>
                <select
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                >
                  <option value="">Select Item</option>
                  {items.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transit Pass No
                </label>
                <input
                  type="text"
                  name="transitPassNo"
                  value={formData.transitPassNo}
                  onChange={handleChange}
                  required
                  pattern="\d{19}"
                  title="Transit pass number must be exactly 19 digits"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity (Cubic Meters)
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  max="99"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Origin Form J No
                </label>
                <input
                  type="text"
                  name="originFormJNo"
                  value={formData.originFormJNo}
                  onChange={handleChange}
                  required
                  pattern="[A-Z]{2}\d{11}"
                  title="Origin Form J number must start with 2 letters followed by 11 numbers"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </div>
            </div>

            {/* Submit Button - Full Width */}
            <div className="md:col-span-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Add Entry
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}