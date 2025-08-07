'use client'

import { useEffect, useState } from 'react'
import Layout from '@/ui/Layout'
import Button from '@/ui/Button/Button'
import { ReportService } from '@/services/report/report.service'
import { IReports, IReportHistory } from '@/shared/interfaces/reports.interface'

export default function ReportsPage() {
  const [available, setAvailable] = useState<IReports[]>([])
  const [history, setHistory] = useState<IReportHistory[]>([])
  const [type, setType] = useState('sales')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [product, setProduct] = useState('')
  const [employee, setEmployee] = useState('')
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    Promise.all([ReportService.getAvailable(), ReportService.getHistory()])
      .then(([avail, hist]) => {
        setAvailable(avail)
        setHistory(hist)
      })
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  const generate = async () => {
    setIsLoading(true)
    try {
      const report = await ReportService.generate({
        type,
        params: { period: { start, end }, product, employee },
      })
      setData(report.data)
      const hist = await ReportService.getHistory()
      setHistory(hist)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async (format: string) => {
    setIsLoading(true)
    try {
      if (!history.length) return
      const last = history[history.length - 1]
      await ReportService.export(last.id, format)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      {isLoading ? (
        <div className="py-4 text-center">Loading...</div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Доступные отчёты</h2>
            <ul className="list-disc pl-4">
              {available.map(r => (
                <li key={r.id}>{r.name}</li>
              ))}
            </ul>
            <Button
              className="mt-2 bg-primary-500 text-white px-4 py-1"
              onClick={generate}
            >
              Generate a new report
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Параметры</h3>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={start}
                onChange={e => setStart(e.target.value)}
                className="border border-neutral-300 rounded px-2 py-1"
              />
              <input
                type="date"
                value={end}
                onChange={e => setEnd(e.target.value)}
                className="border border-neutral-300 rounded px-2 py-1"
              />
              <input
                placeholder="Product"
                value={product}
                onChange={e => setProduct(e.target.value)}
                className="border border-neutral-300 rounded px-2 py-1"
              />
              <input
                placeholder="Employee"
                value={employee}
                onChange={e => setEmployee(e.target.value)}
                className="border border-neutral-300 rounded px-2 py-1"
              />
            </div>
          </div>

          {data && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Результаты</h3>
              <table className="min-w-full bg-neutral-100 rounded shadow-md">
                <tbody>
                  <tr>
                    <td className="p-2">Пример данных</td>
                    <td className="p-2">{JSON.stringify(data)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex space-x-2">
                <Button
                  className="bg-primary-500 text-white px-4 py-1"
                  onClick={() => exportReport('pdf')}
                >
                  Export to PDF
                </Button>
                <Button
                  className="bg-primary-500 text-white px-4 py-1"
                  onClick={() => exportReport('excel')}
                >
                  Export to Excel
                </Button>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-2">История</h3>
            <ul className="list-disc pl-4">
              {history.map(h => (
                <li key={h.id}>
                  {h.type} - {new Date(h.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
          {error && <p className="text-error">{error}</p>}
        </div>
      )}
    </Layout>
  )
}
