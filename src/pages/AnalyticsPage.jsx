import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { BarChart3 } from 'lucide-react'

export function AnalyticsPage() {
  return (
    <div className="flex-1 p-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="h-64">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Chart {index + 1}
              </CardTitle>
              <CardDescription>Placeholder for chart component</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">Drag and drop charts here</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

