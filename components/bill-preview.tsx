"use client"

import { forwardRef } from "react"
import JsBarcode from "jsbarcode"
import { useEffect, useRef } from "react"

interface FoodItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface BillPreviewProps {
  restaurantName: string
  restaurantAddress: string
  phoneNumbers: string
  billNumber: string
  tableNumber: string | null
  billDate: string
  billTime: string
  foodItems: FoodItem[]
  subtotal: number
  serviceCharge: number
  serviceChargePercentage: number
  gstAmount: number
  gstPercentage: number
  total: number
}

const BillPreview = forwardRef<HTMLDivElement, BillPreviewProps>(
  (
    {
      restaurantName,
      restaurantAddress,
      phoneNumbers,
      billNumber,
      tableNumber,
      billDate,
      billTime,
      foodItems,
      subtotal,
      serviceCharge,
      serviceChargePercentage,
      gstAmount,
      gstPercentage,
      total,
    },
    ref,
  ) => {
    const barcodeRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
      if (barcodeRef.current) {
        try {
          JsBarcode(barcodeRef.current, billNumber, {
            format: "CODE128",
            width: 1.5,
            height: 40,
            displayValue: false,
          })
        } catch (e) {
          console.error("Error generating barcode:", e)
        }
      }
    }, [billNumber])

    return (
      <div ref={ref} className="p-4 text-sm font-mono bg-white" style={{ width: "80mm", margin: "0 auto" }}>
        <div className="text-center mb-2">
          <h1 className="text-xl font-bold">{restaurantName}</h1>
          <p className="text-xs whitespace-pre-wrap">{restaurantAddress}</p>
        </div>

        <div className="border-t border-b border-dashed py-2 mb-2">
          <div className="flex justify-between">
            <span>Bill No: {billNumber}</span>
            {tableNumber && <span>Table: {tableNumber}</span>}
          </div>
          <div className="flex justify-between">
            <span>Date: {billDate}</span>
            <span>Time: {billTime}</span>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between font-bold border-b">
            <span className="w-1/2">Item</span>
            <span className="w-1/6 text-center">Qty</span>
            <span className="w-1/6 text-right">Price</span>
            <span className="w-1/6 text-right">Total</span>
          </div>

          {foodItems.map((item) => (
            <div key={item.id} className="flex justify-between py-1">
              <span className="w-1/2 truncate">{item.name}</span>
              <span className="w-1/6 text-center">{item.quantity}</span>
              <span className="w-1/6 text-right">₹{item.price.toFixed(2)}</span>
              <span className="w-1/6 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed pt-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Charge ({serviceChargePercentage}%):</span>
            <span>₹{serviceCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST ({gstPercentage}%):</span>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-b border-dashed py-1 my-1">
            <span>TOTAL:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-center mt-4 mb-2">
          <div className="text-center">
            <canvas ref={barcodeRef}></canvas>
            <p className="text-xs mt-1">{billNumber}</p>
          </div>
        </div>

        <div className="text-center text-xs mt-4">
          <p>Contact: {phoneNumbers}</p>
          <p className="mt-2">Thank you for your visit!</p>
          <p>Please visit again</p>
        </div>
      </div>
    )
  },
)

BillPreview.displayName = "BillPreview"

export default BillPreview
