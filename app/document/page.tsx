// app/picking-slip/page.tsx
import React from "react";
import styles from "./PickingSlip.module.css";
import dynamic from "next/dynamic";

interface Item {
  itemCode: string;
  description: string;
  rep: string;
  price: string;
  unitsRequired: string;
  qtyPicked: string;
  sku: string;
}

interface SampleData {
  company: {
    name: string;
    address: string;
  };
  recipient: {
    code: string;
    name: string;
    details: string;
  };
  order: {
    account: string;
    date: string;
    dueDate: string;
    orderNo: string;
    deliveryMode: string;
    custOrderNo: string;
  };
  items: Item[];
  totals: {
    excl: string;
    tax: string;
    incl: string;
    discount: string;
  };
}

// Dynamically import the PrintButton component
const PrintButton = dynamic(() => import("../components/PrintButton"), {
  ssr: false,
});

const PickingSlip: React.FC = () => {
  const sampleData: SampleData = {
    company: {
      name: "D.K. GAS APPLIANCES (PTY) LTD",
      address: "482C SUNBEAM STREET, ICON PARK, SUNDERLAND RIDGE, PRETORIA",
    },
    recipient: {
      code: "SHO740",
      name: "OKF ESTCOURT (9297)",
      details:
        "OK FURNITURES, SHOPRITE CHECKERS (PTY) LTD, 157 ALBERT STREET, ESTCOURT",
    },
    order: {
      account: "SHO740",
      date: "2024/07/16",
      dueDate: "2024/07/16",
      orderNo: "ORD320737",
      deliveryMode: "",
      custOrderNo: "834790",
    },
    items: [
      {
        itemCode: "25/009/2P",
        description: "TOTAL 2M BULLNOSE REGULATOR KIT",
        rep: "245",
        price: "169.00",
        unitsRequired: "2.00",
        qtyPicked: "2.00",
        sku: "214085 2024/07/31",
      },
      {
        itemCode: "24/0099T",
        description: "TOTAL 9KG EMPTY GAS CYLINDER",
        rep: "245",
        price: "760.00",
        unitsRequired: "3.00",
        qtyPicked: "3.00",
        sku: "214086 2024/07/31",
      },
    ],
    totals: {
      excl: "2618.00",
      tax: "392.70",
      incl: "3010.70",
      discount: "0.00",
    },
  };

  return (
    <div className={styles.pickingSlipRoot}>
      <div className={styles.pickingSlipContainer}>
        <h1>Picking Slip</h1>
        <div className={styles.pickingSlipHeader}>
          <div>
            <strong>{sampleData.company.name}</strong>
            <p>{sampleData.company.address}</p>
          </div>
          <div className={styles.pickingSlipTo}>
            <strong>To:</strong>
            <p>{sampleData.recipient.code}</p>
            <p>{sampleData.recipient.name}</p>
            <p>{sampleData.recipient.details}</p>
          </div>
        </div>
        <div className={styles.pickingSlipOrderDetails}>
          <div>
            <strong>Account:</strong> {sampleData.order.account}
          </div>
          <div>
            <strong>Date:</strong> {sampleData.order.date}
          </div>
          <div>
            <strong>Due Date:</strong> {sampleData.order.dueDate}
          </div>
          <div>
            <strong>Order No:</strong> {sampleData.order.orderNo}
          </div>
          <div>
            <strong>Delivery Mode:</strong> {sampleData.order.deliveryMode}
          </div>
          <div>
            <strong>Cust Order No:</strong> {sampleData.order.custOrderNo}
          </div>
        </div>
        <table className={styles.pickingSlipTable}>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Item Description</th>
              <th>Rep</th>
              <th>Price</th>
              <th>Units Required</th>
              <th>Qty Picked</th>
              <th>Checked By</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.items.map((item, index) => (
              <tr key={index}>
                <td>{item.itemCode}</td>
                <td>
                  {item.description}
                  <br />
                  <small>SKU: {item.sku}</small>
                </td>
                <td>{item.rep}</td>
                <td>{item.price}</td>
                <td>{item.unitsRequired}</td>
                <td>{item.qtyPicked}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pickingSlipFooter}>
          <div className={styles.pickingSlipLeft}>
            <div>Picked by: </div>
            <div>Date: </div>
            <div>Invoice Date: </div>
            <div>Invoice time: </div>
          </div>
          <div className={styles.pickingSlipRight}>
            <div>
              <strong>Total (Excl):</strong> {sampleData.totals.excl}
            </div>
            <div>
              <strong>Tax:</strong> {sampleData.totals.tax}
            </div>
            <div>
              <strong>Total (Incl):</strong> {sampleData.totals.incl}
            </div>
            <div>
              <strong>Discount:</strong> {sampleData.totals.discount}
            </div>
            <div>
              <strong>Total (Incl):</strong> {sampleData.totals.incl}
            </div>
          </div>
        </div>
        <div className="no-print">
          <PrintButton />
        </div>
      </div>
    </div>
  );
};

export default PickingSlip;
