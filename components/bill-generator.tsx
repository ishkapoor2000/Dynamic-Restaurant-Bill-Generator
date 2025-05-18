"use client"

import { useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Printer, Plus, Trash2, RefreshCw, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import BillPreview from "./bill-preview"
import { format, parse } from "date-fns"

interface FoodItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function BillGenerator() {
  const [restaurantName, setRestaurantName] = useState("Delicious Bites")
  const [restaurantAddress, setRestaurantAddress] = useState("123 Food Street, Flavor Town, India")
  const [phoneNumbers, setPhoneNumbers] = useState("+91 9876543210, +91 1234567890")
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    { id: uuidv4(), name: "Butter Chicken", price: 350, quantity: 1 },
    { id: uuidv4(), name: "Garlic Naan", price: 60, quantity: 2 },
  ])
  const [gstPercentage, setGstPercentage] = useState(5)
  const [serviceChargePercentage, setServiceChargePercentage] = useState(10)
  const [billNumber, setBillNumber] = useState(`BILL-${Math.floor(10000 + Math.random() * 90000)}`)
  const [tableNumber, setTableNumber] = useState<string | null>(null)
  const [billDate, setBillDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [billTime, setBillTime] = useState(format(new Date(), "HH:mm"))
  const printRef = useRef<HTMLDivElement>(null)

  // Generate random table number on initial load
  useEffect(() => {
    generateRandomTableNumber()
  }, [])

  const generateRandomTableNumber = () => {
    // 20% chance to have no table number
    if (Math.random() < 0.2) {
      setTableNumber(null)
    } else {
      // Generate random 2-digit number (10-99)
      const randomNum = Math.floor(10 + Math.random() * 90)
      setTableNumber(randomNum.toString())
    }
  }

  const addFoodItem = () => {
    setFoodItems([...foodItems, { id: uuidv4(), name: "", price: 0, quantity: 1 }])
  }

  const removeFoodItem = (id: string) => {
    setFoodItems(foodItems.filter((item) => item.id !== id))
  }

  const updateFoodItem = (id: string, field: keyof FoodItem, value: string | number) => {
    setFoodItems(foodItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const subtotal = foodItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const serviceCharge = (subtotal * serviceChargePercentage) / 100
  const gstAmount = (subtotal * gstPercentage) / 100
  const total = subtotal + serviceCharge + gstAmount

  // Format date and time for display
  const formattedDate = format(parse(billDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")
  const formattedTime = format(parse(billTime, "HH:mm", new Date()), "hh:mm a")

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    // Format the date for the filename (removing slashes)
    const filenameDateFormat = formattedDate.replace(/\//g, '')

    // Create the custom filename
    const customFilename = `${restaurantName}-${filenameDateFormat}${billNumber}-${total.toFixed(2)}-food-bill`

    // Set the document title to the custom filename
    printWindow.document.title = customFilename

    // Create a complete standalone HTML document for printing
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Bill</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: monospace;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .print-container {
            width: 80mm;
            background: white;
            margin: 0 auto;
            box-sizing: border-box;
          }
          
          .bill-header {
            text-align: center;
            margin-bottom: 8px;
          }
          
          .bill-header h1 {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 4px 0;
          }
          
          .bill-header p {
            font-size: 10px;
            margin: 0;
            white-space: pre-wrap;
          }
          
          .bill-info {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 8px 0;
            margin-bottom: 8px;
          }
          
          .bill-info-row {
            display: flex;
            justify-content: space-between;
          }
          
          .items-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            border-bottom: 1px solid #000;
          }
          
          .items-header span:nth-child(1) { width: 50%; }
          .items-header span:nth-child(2) { width: 16.66%; text-align: center; }
          .items-header span:nth-child(3) { width: 16.66%; text-align: right; }
          .items-header span:nth-child(4) { width: 16.66%; text-align: right; }
          
          .item-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
          }
          
          .item-row span:nth-child(1) { width: 50%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .item-row span:nth-child(2) { width: 16.66%; text-align: center; }
          .item-row span:nth-child(3) { width: 16.66%; text-align: right; }
          .item-row span:nth-child(4) { width: 16.66%; text-align: right; }
          
          .totals {
            border-top: 1px dashed #000;
            padding-top: 8px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
          }
          
          .final-total {
            font-weight: bold;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 4px 0;
            margin: 4px 0;
          }
          
          .barcode-container {
            display: flex;
            justify-content: center;
            margin: 16px 0 8px 0;
          }
          
          .barcode-container div {
            text-align: center;
          }
          
          .barcode-container p {
            font-size: 10px;
            margin-top: 4px;
          }
          
          .contact-info {
            text-align: center;
            font-size: 10px;
            margin-top: 16px;
          }
          
          .contact-info p {
            margin: 0;
          }
          
          .contact-info p:nth-child(2) {
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="bill-header">
            <h1>${restaurantName}</h1>
            <p>${restaurantAddress}</p>
          </div>
          
          <div class="bill-info">
            <div class="bill-info-row">
              <span>Bill No: ${billNumber}</span>
              ${tableNumber ? `<span>Table: ${tableNumber}</span>` : "<span></span>"}
            </div>
            <div class="bill-info-row">
              <span>Date: ${formattedDate}</span>
              <span>Time: ${formattedTime}</span>
            </div>
          </div>
          
          <div class="items-header">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Total</span>
          </div>
          
          ${foodItems
            .map(
              (item) => `
            <div class="item-row">
              <span>${item.name}</span>
              <span>${item.quantity}</span>
              <span>₹${item.price.toFixed(2)}</span>
              <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `,
            )
            .join("")}
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Service Charge (${serviceChargePercentage}%):</span>
              <span>₹${serviceCharge.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>GST (${gstPercentage}%):</span>
              <span>₹${gstAmount.toFixed(2)}</span>
            </div>
            <div class="total-row final-total">
              <span>TOTAL:</span>
              <span>₹${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="barcode-container">
            <div>
              <canvas id="barcode"></canvas>
              <p>${billNumber}</p>
            </div>
          </div>
          
          <div class="contact-info">
            <p>Contact: ${phoneNumbers}</p>
            <p>Thank you for your visit!</p>
            <p>Please visit again</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            JsBarcode("#barcode", "${billNumber}", {
              format: "CODE128",
              width: 1.5,
              height: 40,
              displayValue: false
            });
            
            // Add a small delay before printing to ensure everything is rendered
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `)

    printWindow.document.close()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Bill Information</h2>

        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="restaurantName">Restaurant Name</Label>
            <Input id="restaurantName" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="restaurantAddress">Restaurant Address</Label>
            <Input
              id="restaurantAddress"
              value={restaurantAddress}
              onChange={(e) => setRestaurantAddress(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="phoneNumbers">Phone Numbers (comma separated)</Label>
            <Input id="phoneNumbers" value={phoneNumbers} onChange={(e) => setPhoneNumbers(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="billNumber">Bill Number</Label>
            <Input id="billNumber" value={billNumber} onChange={(e) => setBillNumber(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="tableNumber">Table Number</Label>
              <div className="flex gap-2">
                <Input
                  id="tableNumber"
                  value={tableNumber || ""}
                  onChange={(e) => setTableNumber(e.target.value || null)}
                  placeholder={tableNumber === null ? "No table" : ""}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={generateRandomTableNumber}
                  title="Generate random table number"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Date
              </Label>
              <Input id="billDate" type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="billTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Time
              </Label>
              <Input id="billTime" type="time" value={billTime} onChange={(e) => setBillTime(e.target.value)} />
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-3">Food Items</h3>
        <div className="space-y-3 mb-4">
          {foodItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateFoodItem(item.id, "name", e.target.value)}
                />
              </div>
              <div className="w-20">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateFoodItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => updateFoodItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeFoodItem(item.id)}
                disabled={foodItems.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={addFoodItem} className="mb-6" variant="outline">
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>

        <h3 className="text-lg font-semibold mb-3">Charges</h3>
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="gstPercentage">GST Percentage (%)</Label>
            <Input
              id="gstPercentage"
              type="number"
              value={gstPercentage}
              onChange={(e) => setGstPercentage(Number.parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="serviceChargePercentage">Service Charge Percentage (%)</Label>
            <Input
              id="serviceChargePercentage"
              type="number"
              value={serviceChargePercentage}
              onChange={(e) => setServiceChargePercentage(Number.parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" /> Print Bill
          </Button>
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">Bill Preview</h2>
        <div className="bg-white border rounded-md shadow-sm overflow-hidden inline-block">
          <BillPreview
            ref={printRef}
            restaurantName={restaurantName}
            restaurantAddress={restaurantAddress}
            phoneNumbers={phoneNumbers}
            billNumber={billNumber}
            tableNumber={tableNumber}
            billDate={formattedDate}
            billTime={formattedTime}
            foodItems={foodItems}
            subtotal={subtotal}
            serviceCharge={serviceCharge}
            serviceChargePercentage={serviceChargePercentage}
            gstAmount={gstAmount}
            gstPercentage={gstPercentage}
            total={total}
          />
        </div>
      </div>
    </div>
  )
}
