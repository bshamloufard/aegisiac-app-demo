import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Upload, FileText, Trash2 } from 'lucide-react'

export function DataPage() {
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      uploadDate: new Date().toLocaleDateString(),
    }))
    setUploadedFiles([...uploadedFiles, ...newFiles])
    e.target.value = ''
  }

  const handleDelete = (id) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id))
  }

  // Convert bytes to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="flex-1 p-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload New Data
            </CardTitle>
            <CardDescription>
              Select files to upload to your data collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg hover:bg-accent transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">Multiple files supported</p>
                </div>
              </div>
              <Input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Previous Data
            </CardTitle>
            <CardDescription>
              View and manage your uploaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploadedFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No files uploaded yet</p>
                <p className="text-sm mt-2">Upload files to see them here</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.uploadDate}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file.id)}
                      className="ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

