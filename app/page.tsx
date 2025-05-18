import BillGenerator from "@/components/bill-generator"

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Restaurant Bill Generator</h1>
      <BillGenerator />
    </main>
  )
}
