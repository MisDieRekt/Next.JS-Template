import React from 'react';

interface TableProps {
  tripData: any[];
  clickedRows: Set<number>;
  toggleRowBackground: (index: number) => void;
  handleRightClick: (event: React.MouseEvent, index: number) => void;
  contextMenu: any;
  closeContextMenu: () => void;
}

const Table: React.FC<TableProps> = ({
  tripData,
  clickedRows,
  toggleRowBackground,
  handleRightClick,
  contextMenu,
  closeContextMenu
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {["Order Received Date", "Order Date", "Customer Account", "Customer Name", "External Order Num", "Order Num", "Soq No", "Picker", "Invoice Date", "Invoice Number", "Delivery Note Number", "Delivery Method", "Invoice Total Excl", "Dispatch Date", "Registration Number", "Pod Date"].map(header => (
              <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tripData.map((item, index) => (
            <tr key={index} className={`hover:bg-green-500 ${clickedRows.has(index) ? 'bg-red-200' : ''}`} onClick={() => toggleRowBackground(index)} onContextMenu={(event) => handleRightClick(event, index)}>
              {Object.keys(item).map(key => key !== "AutoIndex" && (
                <td key={key} className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {key.includes('Date') ? formatDate(item[key]) : 
                    key === 'Invoice Total Excl' ? formatCurrency(item[key]) :
                    item[key] || 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />}
    </div>
  );
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(date);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
};

const ContextMenu: React.FC<{ x: number, y: number, onClose: () => void }> = ({ x, y, onClose }) => (
  <div className="absolute bg-white shadow-lg border border-gray-300" style={{ top: y, left: x }}>
    <ul className="text-gray-700">
      <li className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => alert('Option 1 selected')}>Get Order Details</li>
      <li className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => alert('Option 2 selected')}>Track With Courier</li>
      <li className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => alert('Option 3 selected')}>Option 3</li>
    </ul>
  </div>
);

export default Table;
