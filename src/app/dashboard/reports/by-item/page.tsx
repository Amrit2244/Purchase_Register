'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';

// Add TypeScript declaration for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Add XLSX utility types
declare module 'xlsx' {
  interface IUtils {
    json_to_sheet: (data: any[]) => any;
    book_new: () => any;
    book_append_sheet: (workbook: any, worksheet: any, name: string) => void;
  }
  
  interface IWrite {
    bookType: string;
    type: string;
  }
}

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
  party: Party; // Keep Party here as PurchaseEntry model refers to it
  item: Item;
  transitPassNo: string;
  quantity: number;
  originFormJNo: string;
}

// Stylish Logo Component (remains the same)
const StylishLogo = ({ className = "w-24 h-24" }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b5998" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="stoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Main circle */}
      <circle cx="50" cy="50" r="45" fill="white" stroke="url(#logoGradient)" strokeWidth="3" filter="url(#shadow)" />
      
      {/* Stone crusher machine */}
      <rect x="30" y="35" width="40" height="25" fill="#334155" rx="2" stroke="url(#logoGradient)" strokeWidth="1.5" />
      <rect x="25" y="60" width="50" height="12" fill="#1e293b" rx="1" stroke="url(#logoGradient)" strokeWidth="1.5" />
      
      {/* Gears/wheels */}
      <circle cx="36" cy="48" r="5" fill="url(#stoneGradient)" stroke="#334155" strokeWidth="1" />
      <circle cx="64" cy="48" r="5" fill="url(#stoneGradient)" stroke="#334155" strokeWidth="1" />
      
      {/* Rocks/stones */}
      <path d="M25,30 L35,35 L30,40 L20,38 Z" fill="url(#stoneGradient)" stroke="#475569" strokeWidth="1" />
      <path d="M75,32 L82,37 L80,42 L70,40 Z" fill="url(#stoneGradient)" stroke="#475569" strokeWidth="1" />
      <path d="M40,75 L50,72 L55,78 L45,82 L38,80 Z" fill="url(#stoneGradient)" stroke="#475569" strokeWidth="1" />
      <path d="M60,75 L65,71 L70,76 L68,82 L60,80 Z" fill="url(#stoneGradient)" stroke="#475569" strokeWidth="1" />
      
      {/* Conveyor belt */}
      <path d="M30,66 L40,72 L60,72 L70,66" fill="none" stroke="#334155" strokeWidth="2" />
      
      {/* Text */}
      <text x="50" y="25" fontSize="18" fontWeight="bold" fill="#334155" textAnchor="middle">B S F </text>
      <text x="50" y="90" fontSize="10" fontWeight="bold" fill="#475569" textAnchor="middle">EST. 2010</text>
    </svg>
  );
};

export default function ItemReportsPage() {
  const [items, setItems] = useState<Item[]>([]); // Changed from parties to items
  const [entries, setEntries] = useState<PurchaseEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    toDate: new Date().toISOString().split('T')[0], // Today
    item: '', // Changed from party to item
  });
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState(''); // Changed from selectedPartyName
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchItems(); // Changed from fetchParties
  }, []);

  const fetchItems = async () => { // Changed from fetchParties
    try {
      const response = await fetch('/api/items'); // Changed API endpoint
      const data = await response.json();
      setItems(data); // Changed from setParties to setItems
    } catch (error) {
      console.error('Error fetching items:', error); // Changed error message
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update selected item name for report title
    if (name === 'item' && value) { // Changed from party to item
      const selectedItem = items.find(item => item._id === value); // Changed from parties to items
      if (selectedItem) {
        setSelectedItemName(selectedItem.name); // Changed from setSelectedPartyName
      }
    } else if (name === 'item' && !value) { // Changed from party to item
      setSelectedItemName(''); // Changed from setSelectedPartyName
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Build the query string from the filters
      const params = new URLSearchParams();
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.item) params.append('item', filters.item); // Changed from party to item
      
      const response = await fetch(`/api/purchase-entries/reports?${params.toString()}`);
      const data = await response.json();
      
      setEntries(data);
      setIsFiltered(true);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate total quantity
  const totalQuantity = entries.reduce((total, entry) => total + entry.quantity, 0);

  // Enhanced Excel Export  
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const companyInfo = [
        ['BABA SHEKH FARID NATURAL PLANT AND STONE PRODUCTS'],
        ['PURCHASE REGISTER'],
        ['Village Patti Kalan Tehsil Swar District Rampur'],
        ['License: NOC/ST/2025/1/24/467905'],
        ['']
      ];
      
      const title = selectedItemName // Changed from selectedPartyName
        ? `Purchase Report - ${selectedItemName}` // Changed from selectedPartyName
        : 'Item Purchase Report'; // Changed title
        
      const dateInfo = [
        [title],
        [`Period: ${filters?.fromDate && filters?.toDate 
          ? `${new Date(filters.fromDate).toLocaleDateString()} to ${new Date(filters.toDate).toLocaleDateString()}`
          : 'All Time'}`
        ],
        ['']
      ];

      const headers = ['Serial No', 'Date', 'Vehicle No', 'Party', 'Item', 'Transit Pass No', 'Quantity', 'Origin Form J No'];
      
      const data = entries.map((entry, index) => [
        index + 1,
        formatDate(entry.date),
        entry.vehicleNumber,
        entry.party.name, // Party name is still relevant in the entry
        entry.item.name,
        entry.transitPassNo,
        entry.quantity,
        entry.originFormJNo
      ]);
      
      const totalRow = ['', '', '', '', '', 'Total', totalQuantity, ''];
      
      const allData = [
        ...companyInfo,
        ...dateInfo,
        headers,
        ...data,
        totalRow
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(allData);
      
      ws['A1'] = { v: 'BABA SHEKH FARID NATURAL PLANT AND STONE PRODUCTS', s: { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } } };
      ws['A2'] = { v: 'PURCHASE REGISTER', s: { font: { bold: true, sz: 14, color: { rgb: 'FF0000' } }, alignment: { horizontal: 'center' } } };
      
      for (let i = 0; i < headers.length; i++) {
        const cell = XLSX.utils.encode_cell({ r: companyInfo.length + dateInfo.length, c: i });
        if (!ws[cell]) continue;
        ws[cell].s = { 
          font: { bold: true },
          fill: { fgColor: { rgb: 'CCCCCC' } },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      }
      
      XLSX.utils.book_append_sheet(wb, ws, 'Purchase Report');
      XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`); // Updated title for filename
      toast.success('Report exported to Excel successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  // Enhanced PDF Export
  const exportToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      
      try {
        const logoSvg = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3b5998" />
              <stop offset="50%" stop-color="#4f46e5" />
              <stop offset="100%" stop-color="#6d28d9" />
            </linearGradient>
            <linearGradient id="stoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#64748b" />
              <stop offset="50%" stop-color="#94a3b8" />
              <stop offset="100%" stop-color="#64748b" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="white" stroke="#4f46e5" stroke-width="3" />
          <rect x="30" y="35" width="40" height="25" fill="#334155" rx="2" stroke="#4f46e5" stroke-width="1.5" />
          <rect x="25" y="60" width="50" height="12" fill="#1e293b" rx="1" stroke="#4f46e5" stroke-width="1.5" />
          <circle cx="36" cy="48" r="5" fill="#94a3b8" stroke="#334155" stroke-width="1" />
          <circle cx="64" cy="48" r="5" fill="#94a3b8" stroke="#334155" stroke-width="1" />
          <path d="M25,30 L35,35 L30,40 L20,38 Z" fill="#94a3b8" stroke="#475569" stroke-width="1" />
          <path d="M75,32 L82,37 L80,42 L70,40 Z" fill="#94a3b8" stroke="#475569" stroke-width="1" />
          <path d="M40,75 L50,72 L55,78 L45,82 L38,80 Z" fill="#94a3b8" stroke="#475569" stroke-width="1" />
          <path d="M60,75 L65,71 L70,76 L68,82 L60,80 Z" fill="#94a3b8" stroke="#475569" stroke-width="1" />
          <path d="M30,66 L40,72 L60,72 L70,66" fill="none" stroke="#334155" stroke-width="2" />
          <text x="50" y="25" font-size="10" font-weight="bold" fill="#334155" text-anchor="middle">STONE CRUSHER</text>
          <text x="50" y="90" font-size="8" font-weight="bold" fill="#475569" text-anchor="middle">EST. 2022</text>
        </svg>`;
        
        const svgBlob = new Blob([logoSvg], { type: 'image/svg+xml' });
        const reader = new FileReader();
        reader.readAsDataURL(svgBlob);
        reader.onloadend = function() {
          const base64data = reader.result;
          doc.addImage(base64data as string, 'SVG', pageWidth/2 - 15, 8, 30, 30);
          
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(63, 81, 181);
          doc.text('BABA SHEKH FARID NATURAL PLANT AND STONE PRODUCTS', pageWidth / 2, 45, { align: 'center' });
          
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(220, 53, 69);
          doc.text('PURCHASE REGISTER', pageWidth / 2, 53, { align: 'center' });
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0);
          doc.text('Village Patti Kalan Tehsil Swar District Rampur', pageWidth / 2, 60, { align: 'center' });
          doc.text('Phone: +91 9837041014', pageWidth / 2, 65, { align: 'center' });
          
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 120);
          doc.text('License: NOC/ST/2025/1/24/467905', 15, 60);
          doc.setTextColor(0);

          const lineY = 69;
          doc.setDrawColor(63, 81, 181);
          doc.setLineWidth(0.8);
          doc.line(15, lineY, pageWidth - 15, lineY);
          
          doc.setDrawColor(220, 53, 69);
          doc.setLineWidth(0.5);
          doc.line(15, lineY + 2, pageWidth - 15, lineY + 2);
          
          doc.setDrawColor(40, 167, 69);
          doc.setLineWidth(0.3);
          doc.line(15, lineY + 4, pageWidth - 15, lineY + 4);
          
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(63, 81, 181);
          
          const title = selectedItemName // Changed from selectedPartyName
            ? `${selectedItemName} - Purchase Report` // Changed from selectedPartyName
            : 'Item Purchase Report'; // Changed title
          
          doc.text(title, pageWidth / 2, 80, { align: 'center' });
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 120);
          const dateRange = filters?.fromDate && filters?.toDate
            ? `${new Date(filters.fromDate).toLocaleDateString()} to ${new Date(filters.toDate).toLocaleDateString()}`
            : 'All Time';
          doc.text(`Period: ${dateRange}`, pageWidth / 2, 87, { align: 'center' });
          doc.setTextColor(0);

          const tableData = entries.map(entry => [
            entry.serialNumber.toString().padStart(2, '0'),
            formatDate(entry.date),
            entry.vehicleNumber,
            entry.party?.name || 'Unknown Party', // Party name still relevant
            entry.item?.name || 'Unknown Item',
            entry.transitPassNo,
            entry.quantity.toString(),
            entry.originFormJNo
          ]);

          tableData.push([
            '', '', '', '', '', 'Total Quantity:', totalQuantity.toString(), ''
          ]);

          doc.autoTable({
            head: [['Serial No', 'Date', 'Vehicle No', 'Party', 'Item', 'Transit Pass No', 'Quantity', 'Origin Form J No']],
            body: tableData,
            startY: 93,
            theme: 'grid',
            styles: { 
              fontSize: 9, 
              cellPadding: 3,
              lineColor: [80, 80, 120],
              lineWidth: 0.1
            },
            headStyles: { 
              fillColor: [63, 81, 181], 
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              halign: 'center'
            },
            alternateRowStyles: {
              fillColor: [242, 242, 252]
            },
            footStyles: { 
              fillColor: [220, 53, 69, 0.2], 
              fontStyle: 'bold',
              textColor: [220, 53, 69]
            },
            columnStyles: {
              0: { halign: 'center' },
              1: { halign: 'center' },
              6: { halign: 'right' }
            }
          });

          doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`); // Updated title for filename
        };
      } catch (logoError) {
        console.error('Error adding logo to PDF:', logoError);
        continueWithPDFGeneration(); // Fallback if logo fails
      }
      
      function continueWithPDFGeneration() {
        // This function is a fallback if logo processing fails.
        // It mirrors the PDF generation logic from above but without the logo.
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(63, 81, 181);
        doc.text('BABA SHEKH FARID NATURAL PLANT AND STONE PRODUCTS', pageWidth / 2, 45, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 53, 69);
        doc.text('PURCHASE REGISTER', pageWidth / 2, 53, { align: 'center' });
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);
        doc.text('Village Patti Kalan Tehsil Swar District Rampur', pageWidth / 2, 60, { align: 'center' });
        doc.text('Phone: +91 9837041014', pageWidth / 2, 65, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 120);
        doc.text('License: NOC/ST/2025/1/24/467905', 15, 60);
        doc.setTextColor(0);

        const lineY = 69;
        doc.setDrawColor(63, 81, 181);
        doc.setLineWidth(0.8);
        doc.line(15, lineY, pageWidth - 15, lineY);
        doc.setDrawColor(220, 53, 69);
        doc.setLineWidth(0.5);
        doc.line(15, lineY + 2, pageWidth - 15, lineY + 2);
        doc.setDrawColor(40, 167, 69);
        doc.setLineWidth(0.3);
        doc.line(15, lineY + 4, pageWidth - 15, lineY + 4);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(63, 81, 181);
        
        const title = selectedItemName 
          ? `${selectedItemName} - Purchase Report` 
          : 'Item Purchase Report';
        doc.text(title, pageWidth / 2, 80, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 120);
        const dateRange = filters?.fromDate && filters?.toDate
          ? `${new Date(filters.fromDate).toLocaleDateString()} to ${new Date(filters.toDate).toLocaleDateString()}`
          : 'All Time';
        doc.text(`Period: ${dateRange}`, pageWidth / 2, 87, { align: 'center' });
        doc.setTextColor(0);

        const tableData = entries.map(entry => [
          entry.serialNumber.toString().padStart(2, '0'),
          formatDate(entry.date),
          entry.vehicleNumber,
          entry.party?.name || 'Unknown Party',
          entry.item?.name || 'Unknown Item',
          entry.transitPassNo,
          entry.quantity.toString(),
          entry.originFormJNo
        ]);
        tableData.push(['', '', '', '', '', 'Total Quantity:', totalQuantity.toString(), '']);

        doc.autoTable({
          head: [['Serial No', 'Date', 'Vehicle No', 'Party', 'Item', 'Transit Pass No', 'Quantity', 'Origin Form J No']],
          body: tableData,
          startY: 93,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3, lineColor: [80, 80, 120], lineWidth: 0.1 },
          headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
          alternateRowStyles: { fillColor: [242, 242, 252] },
          footStyles: { fillColor: [220, 53, 69, 0.2], fontStyle: 'bold', textColor: [220, 53, 69] },
          columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' }, 6: { halign: 'right' } }
        });
        doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: white;
          }
          .print\:block {
            display: block !important;
          }
          .print\:hidden {
            display: none !important;
          }
          .company-header {
            padding-bottom: 10mm;
            margin-bottom: 8mm;
          }
          table {
            page-break-inside: auto;
            width: 100%;
            font-size: 11pt;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
          .overflow-x-auto {
            overflow-x: visible !important;
          }
          th, td {
            padding: 5mm 3mm !important;
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 shadow-xl rounded-2xl p-8 border border-gray-100 mb-8 print:shadow-none"
        >
          <div className="flex flex-col items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-indigo-700 mb-1">Purchase Register</h2>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Item Purchase Reports</h3> {/* Changed title */}
            <div className="flex space-x-2">
              <div className="h-1 w-16 bg-red-500 rounded-full"></div>
              <div className="h-1 w-24 bg-indigo-600 rounded-full"></div>
              <div className="h-1 w-16 bg-green-500 rounded-full"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item {/* Changed label */}
              </label>
              <select
                name="item" // Changed name attribute
                value={filters.item} // Changed value binding
                onChange={handleFilterChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              >
                <option value="">Select Item</option> {/* Changed placeholder */}
                {items.map((item) => ( // Changed from parties to items
                  (<option key={item._id} value={item._id}>
                    {item.name}
                  </option>)
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {isFiltered && (
          <motion.div
            ref={printRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 print:shadow-none print:border-0"
            data-print-section
          >
            <div className="print:block hidden">
              <div className="company-header pb-4 mb-6 border-b-2 border-gray-200">
                <div className="flex flex-col items-center mb-4">
                  <StylishLogo className="w-24 h-24 mb-3" />
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-indigo-800 text-center">
                      M/s BABA SHEKH FARID NATURAL PLANT AND STONE PRODUCTS
                    </h1>
                    <h2 className="text-xl font-bold text-red-600 mt-1">
                      PURCHASE REGISTER
                    </h2>
                    <p className="text-sm mt-1">
                      Village Patti Kalan Tehsil Swar District Rampur
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-start mt-2">
                  <div className="text-xs">
                    <span className="font-semibold">Lic No:</span> NOC/ST/2025/1/24/467905
                    <br />
                    <span className="font-semibold">Valid:</span> 29/03/25 to 28/03/28 (three years)
                  </div>
                  <div className="text-xs text-right">
                    <span className="font-semibold">Report Date:</span> {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-1">
                  {selectedItemName ? `${selectedItemName} - Purchase Report` : 'Item Purchase Report'} {/* Changed title */}
                </h2>
                <p className="text-sm font-medium">
                  Period: {formatDate(filters.fromDate)} to {formatDate(filters.toDate)}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-indigo-700">Purchase Entries</h3>
              
              <div className="flex justify-end space-x-4 mt-4 print:hidden">
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 flex items-center"
                  disabled={loading || entries.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-9 3V7a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2z" />
                  </svg>
                  Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 flex items-center"
                  disabled={loading || entries.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-9 3V7a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2z" />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center"
                  disabled={loading || entries.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>
            </div>
            
            {entries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-600 to-blue-500">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Serial No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Vehicle No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Party
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Transit Pass No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Origin Form J No
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entries.map((entry, index) => (
                      <tr key={entry._id} className={index % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.serialNumber.toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(entry.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.vehicleNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.party?.name || 'Unknown Party'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.item?.name || 'Unknown Item'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.transitPassNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.originFormJNo}
                        </td>
                      </tr>
                    ))}
                    
                    <tr className="bg-gradient-to-r from-red-50 to-red-100">
                      <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        Total Quantity:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-700">
                        {totalQuantity}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No entries found for the selected filters.</p>
                <p className="text-gray-400 mt-2">Try adjusting your search criteria.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
