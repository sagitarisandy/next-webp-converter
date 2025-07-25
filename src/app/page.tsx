"use client";
import React, { useState, useCallback } from "react";

interface ConvertedFile {
  name: string;
  url: string;
  originalFile: File;
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      // Filter out duplicate files by name and size
      const uniqueFiles = selectedFiles.filter(newFile => 
        !files.some(existingFile => 
          existingFile.name === newFile.name && existingFile.size === newFile.size
        )
      );
      const newFiles = [...files, ...uniqueFiles].slice(0, 10); // Merge with existing files
      setFiles(newFiles);
      setConvertedFiles([]);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      // Filter out duplicate files by name and size
      const uniqueFiles = droppedFiles.filter(newFile => 
        !files.some(existingFile => 
          existingFile.name === newFile.name && existingFile.size === newFile.size
        )
      );
      const newFiles = [...files, ...uniqueFiles].slice(0, 10); // Merge with existing files
      setFiles(newFiles);
      setConvertedFiles([]);
    }
  }, [files]);

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleBulkConvert = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        if (files.length === 1) {
          // Single file - direct download
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const originalName = files[0].name.split('.')[0];
          setConvertedFiles([{
            name: `${originalName}.webp`,
            url: url,
            originalFile: files[0]
          }]);
        } else {
          // Multiple files - zip download
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'converted-images.zip';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          // Also create individual preview files
          const individualFiles: ConvertedFile[] = [];
          for (const file of files) {
            const singleFormData = new FormData();
            singleFormData.append("image", file);
            singleFormData.append("fileName", file.name.split('.')[0]);
            
            const singleResponse = await fetch("/api/convert-single", {
              method: "POST",
              body: singleFormData,
            });
            
            if (singleResponse.ok) {
              const singleBlob = await singleResponse.blob();
              const singleUrl = URL.createObjectURL(singleBlob);
              individualFiles.push({
                name: `${file.name.split('.')[0]}.webp`,
                url: singleUrl,
                originalFile: file
              });
            }
          }
          setConvertedFiles(individualFiles);
        }
      }
    } catch (error) {
      console.error("Conversion failed:", error);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadSingle = (convertedFile: ConvertedFile) => {
    const a = document.createElement('a');
    a.href = convertedFile.url;
    a.download = convertedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800" style={{ backgroundColor: '#1B232F' }}>
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-3 flex justify-center items-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/elevate-designs-logo.svg" 
                alt="Elevate Designs Logo"
                className="w-24 h-24"
              />
              <h1 className="text-1xl font-bold text-gray-900">
                <span style={{ color: '#1B232F' }}>Image Converter</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Convert Images to WebP Format 🏞️
          </h2>
          <p className="text-m text-gray-300 max-w-2xl mx-auto">
            Upload up to 10 images and convert them to WebP format for better web performance. 
            Download individually or as a zip file.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            style={{ 
              borderColor: dragActive ? '#1B232F' : '#d1d5db',
              backgroundColor: dragActive ? '#f8fafc' : 'white'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isConverting}
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#adb0b5ff' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-medium text-gray-500">
                  Drop your images here, or click to browse
                </p>
                <p className="text-gray-500 mt-2">
                  PNG, JPG, JPEG up to 10 files
                </p>
                {files.length > 0 && (
                  <p className="text-sm mt-2" style={{ color: '#1B232F' }}>
                    Add more files to your selection ({files.length}/10)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Selected Files ({files.length}/10)
              </h3>
              <button
                onClick={() => setFiles([])}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file, index) => (
                <div key={index} className="relative bg-gray-50 rounded-lg p-4 group">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1B232F' }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100 text-red-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleBulkConvert}
                disabled={files.length === 0 || isConverting}
                className="px-8 py-3 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#1B232F' }}
              >
                {isConverting ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Converting...</span>
                  </div>
                ) : (
                  `Convert ${files.length > 1 ? 'All' : ''} to WebP`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Converted Files */}
        {convertedFiles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Conversion Results
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {convertedFiles.map((convertedFile, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 w-full max-w-md" style={{maxWidth: '100%'}}>
                  <div className="aspect-w-16 aspect-h-9 mb-3 sm:mb-4">
                    <img
                      src={convertedFile.url}
                      alt={convertedFile.name}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium text-gray-900 truncate overflow-hidden whitespace-nowrap text-base sm:text-lg"
                        style={{ maxWidth: '100%' }}
                        title={convertedFile.name}
                      >
                        {convertedFile.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        WebP Format
                      </p>
                    </div>
                    <button
                      onClick={() => downloadSingle(convertedFile)}
                      className="w-full sm:w-auto px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
                      style={{ backgroundColor: '#1B232F' }}
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {files.length > 1 && (
              <div className="mt-6 text-center">
                <p className="text-gray-600 mb-4">
                  All files have been automatically downloaded as a zip file.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}