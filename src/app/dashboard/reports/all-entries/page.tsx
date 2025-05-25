'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver'; // Not strictly needed if using XLSX.writeFile
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
  party: Party; 
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
      
      <circle cx="50" cy="50" r="45" fill="white" stroke="url(#logoGradient)" strokeWidth="3" filter="url(#shadow)" />
      <rect x="30" y="35" width="40" height="25" fill="#334155" rx="2" stroke="url(#logoGradient)" strokeWidth="1.5" />
      <rect x="25" y="60" width="50" height="12" fill="#1e293b" rx="1" stroke="url(#logoGradient)" strokeWidth="1.5" />
      <circle cx="36" cy="48" r="5" fill="url(#stoneGradient)" stroke="#334155" strokeWidth="1" />
      <circle cx="64" cy="48" r="5" fill="url(#stoneGradient)" stroke="#334155" strokeWidth="1" />
      <path d="M25,30 L35,35 L30,40 L20,38 Z" fill="url(#stoneGradient)" stroke="#475569" strokeWidth="1" />
      <path d="M75,32 L82,37 L80,42 L70,40 Z" fill="url(#stoneGradient)" stroke="#475569" strokeWidth="1" />
      <path d="M40,75 L50,72 L55,78 L45,82 L38,80 Z" fill="url(#stoneGradient)" stroke="#475569" strokeWidth="1" />
      <path d="M60,75 L65,71 L70,76 L68,82 L60,80 Z" fill="url(#stoneGradient)" stroke="#475569" strokeWidth="1" />
      <path d="M30,66 L40,72 L60,72 L70,66" fill="none" stroke="#334155" strokeWidth="2" />
      <text x="50" y="25" fontSize="18" fontWeight="bold" fill="#334155" textAnchor="middle">B S F </text>
      <text x="50" y="90" fontSize="10" fontWeight="bold" fill="#475569" textAnchor="middle">EST. 2010</text>
    </svg>
  );
};

export default function AllEntriesReportPage() {
  const [entries, setEntries] = useState<PurchaseEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], 
    toDate: new Date().toISOString().split('T')[0], 
  });
  const [isFiltered, setIsFiltered] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // No need to fetch items or parties for this report

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => { // HTMLSelectElement removed
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      // No party or item filter
      
      const response = await fetch(`/api/purchase-entries/reports?${params.toString()}`);
      const data = await response.json();
      
      setEntries(data);
      setIsFiltered(true);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalQuantity = entries.reduce((total, entry) => total + entry.quantity, 0);

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
      
      const title = 'Comprehensive Purchase Report'; // Generic title
        
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
        entry.party?.name || 'N/A', 
        entry.item?.name || 'N/A',
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
        const cellAddress = XLSX.utils.encode_cell({ r: companyInfo.length + dateInfo.length, c: i });
        if (ws[cellAddress]) { // Check if cell exists
          ws[cellAddress].s = { 
            font: { bold: true },
            fill: { fgColor: { rgb: 'CCCCCC' } },
            border: {
              top: { style: 'thin' }, bottom: { style: 'thin' },
              left: { style: 'thin' }, right: { style: 'thin' }
            }
          };
        }
      }
      
      XLSX.utils.book_append_sheet(wb, ws, 'Purchase Report');
      XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Report exported to Excel successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      
      const generatePdfContent = (logoDataUrl?: string) => {
        if (logoDataUrl) {
          doc.addImage(logoDataUrl, 'SVG', pageWidth / 2 - 15, 8, 30, 30);
        }
        
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
        doc.setDrawColor(63, 81, 181); doc.setLineWidth(0.8); doc.line(15, lineY, pageWidth - 15, lineY);
        doc.setDrawColor(220, 53, 69); doc.setLineWidth(0.5); doc.line(15, lineY + 2, pageWidth - 15, lineY + 2);
        doc.setDrawColor(40, 167, 69);  doc.setLineWidth(0.3); doc.line(15, lineY + 4, pageWidth - 15, lineY + 4);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(63, 81, 181);
        const title = 'Comprehensive Purchase Report'; // Generic title
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
          entry.party?.name || 'N/A',
          entry.item?.name || 'N/A',
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
      };
      
      const logoSvg = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b5998" />
            <stop offset="50%" stop-color="#4f46e5" />
            <stop offset="100%" stop-color="#6d28d9" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="white" stroke="#4f46e5" stroke-width="3" />
        <rect x="30" y="35" width="40" height="25" fill="#334155" rx="2" stroke="#4f46e5" stroke-width="1.5" />
        <rect x="25" y="60" width="50" height="12" fill="#1e293b" rx="1" stroke="#4f46e5" stroke-width="1.5" />
        <text x="50" y="25" font-size="10" font-weight="bold" fill="#334155" text-anchor="middle">BSF</text>
      </svg>`;
      
      const svgBlob = new Blob([logoSvg], { type: 'image/svg+xml;charset=utf-8' });
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          generatePdfContent(reader.result as string);
        } catch (e) {
          console.error("Error with base64 logo:", e);
          generatePdfContent(); // Proceed without logo if there's an error with it
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        generatePdfContent(); // Proceed without logo on reader error
      };
      reader.readAsDataURL(svgBlob);

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <style jsx global>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { width: 100%; height: 100%; margin: 0; padding: 0; background-color: white; }
          .print\:block { display: block !important; }
          .print\:hidden { display: none !important; }
          .company-header { padding-bottom: 10mm; margin-bottom: 8mm; }
          table { page-break-inside: auto; width: 100%; font-size: 10pt; } /* Reduced font size for print */
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          .overflow-x-auto { overflow-x: visible !important; }
          th, td { padding: 2mm 1.5mm !important; } /* Reduced padding for print */
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
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Comprehensive Purchase Report</h3> {/* Changed title */}
            <div className="flex space-x-2">
              <div className="h-1 w-16 bg-red-500 rounded-full"></div>
              <div className="h-1 w-24 bg-indigo-600 rounded-full"></div>
              <div className="h-1 w-16 bg-green-500 rounded-full"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Changed grid to md:grid-cols-2 */}
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

            {/* Removed Item/Party filter dropdown */}

            <div className="md:col-span-2"> {/* Changed to md:col-span-2 */}
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
            <div className="print:block hidden"> {/* Print specific header */}
              <div className="company-header pb-4 mb-6 border-b-2 border-gray-200">
                <div className="flex flex-col items-center mb-4">
                  <StylishLogo className="w-20 h-20 mb-2" /> {/* Slightly smaller logo for print */}
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-indigo-800">
                      M/s BABA SHEKH FARID NATURAL PLANT AND STONE PRODUCTS
                    </h1>
                    <h2 className="text-lg font-bold text-red-600 mt-1">
                      PURCHASE REGISTER
                    </h2>
                    <p className="text-xs mt-1">
                      Village Patti Kalan Tehsil Swar District Rampur
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-start mt-1 text-xs">
                  <div><span className="font-semibold">Lic No:</span> NOC/ST/2025/1/24/467905</div>
                  <div><span className="font-semibold">Report Date:</span> {new Date().toLocaleDateString()}</div>
                </div>
              </div>
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold mb-1">Comprehensive Purchase Report</h2>
                <p className="text-xs font-medium">
                  Period: {formatDate(filters.fromDate)} to {formatDate(filters.toDate)}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-indigo-700 print:text-lg">Purchase Entries</h3>
              
              <div className="flex justify-end space-x-3 mt-4 print:hidden"> {/* Reduced space for buttons */}
                <button
                  onClick={exportToExcel}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 flex items-center text-sm"
                  disabled={loading || entries.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 flex items-center text-sm"
                  disabled={loading || entries.length === 0}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center text-sm"
                  disabled={loading || entries.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>
            </div>
            
            {entries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300"> {/* Added border to table */}
                  <thead className="bg-gradient-to-r from-indigo-600 to-blue-500">
                    <tr>
                      {['Serial No', 'Date', 'Vehicle No', 'Party', 'Item', 'Transit Pass No', 'Quantity', 'Origin Form J No'].map(header => (
                        <th key={header} className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider print:px-2 print:py-1">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entries.map((entry, index) => (
                      <tr key={entry._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-indigo-50'} hover:bg-indigo-100 transition-colors`}>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700 print:px-2 print:py-1">
                          {entry.serialNumber.toString().padStart(2, '0')}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700 print:px-2 print:py-1">
                          {formatDate(entry.date)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700 print:px-2 print:py-1">
                          {entry.vehicleNumber}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700 print:px-2 print:py-1">
                          {entry.party?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700 print:px-2 print:py-1">
                          {entry.item?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700 print:px-2 print:py-1">
                          {entry.transitPassNo}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700 text-right print:px-2 print:py-1"> {/* Quantity right aligned */}
                          {entry.quantity}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700 print:px-2 print:py-1">
                          {entry.originFormJNo}
                        </td>
                      </tr>
                    ))}
                    
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-semibold">
                      <td colSpan={6} className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-right print:px-2 print:py-1">
                        Total Quantity:
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs font-bold text-red-700 text-right print:px-2 print:py-1">
                        {totalQuantity}
                      </td>
                      <td className="print:px-2 print:py-1"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No entries found</h3>
                <p className="mt-1 text-sm text-gray-500">No purchase entries match the selected date range.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
