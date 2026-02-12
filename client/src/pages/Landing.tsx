import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Upload, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

// Create a global variable to store files temporarily
(window as any).__pendingFiles = null;

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    const file = files[0];
    console.log('Selected file:', { name: file.name, type: file.type, size: file.size });
    
    // Store the file in a global variable for immediate access
    (window as any).__pendingFiles = [file];
    console.log('Stored file in global variable, redirecting to /tool');
    
    // Redirect immediately
    setLocation('/tool');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header with Logo */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Zap className="w-10 h-10 text-white" />
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Convert PNG to SVG
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Instantly
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Transform your raster images into scalable vector graphics in seconds.
            No signup required, completely free, and processed directly in your browser.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium">100% Client-Side</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium">No File Size Limits</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium">Instant Results</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium">Batch Conversion</span>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="max-w-2xl mx-auto">
          <div
            className={`
              relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-2 border-dashed 
              transition-all duration-300 overflow-hidden
              ${isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
                : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="p-12 sm:p-16 text-center">
              {/* Upload Icon */}
              <div className={`
                inline-flex items-center justify-center w-24 h-24 rounded-full mb-8
                transition-all duration-300
                ${isDragging 
                  ? 'bg-blue-100 dark:bg-blue-900/40 scale-110' 
                  : 'bg-slate-100 dark:bg-slate-700'
                }
              `}>
                <Upload className={`
                  w-12 h-12 transition-colors duration-300
                  ${isDragging 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-400 dark:text-slate-500'
                  }
                `} />
              </div>

              {/* Instructions */}
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                {isDragging ? 'Drop your image here' : 'Drag & Drop Your Image'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                or click the button below to browse
              </p>

              {/* Upload Button */}
              <Button
                onClick={handleClick}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Image
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/avif"
                onChange={handleFileInputChange}
                className="hidden"
                multiple
              />

              {/* Supported Formats */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
                Supports: PNG, JPG, GIF, WebP, AVIF
              </p>
            </div>

            {/* Animated Background Gradient */}
            <div className="absolute inset-0 -z-10 opacity-30">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl animate-blob" />
              <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl animate-blob animation-delay-2000" />
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl animate-blob animation-delay-4000" />
            </div>
          </div>

          {/* Quick Start Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => setLocation('/tool')}
              className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
            >
              Skip and go to tool →
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Lightning Fast</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Powered by WebAssembly for instant conversion
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">100% Private</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your files never leave your browser
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Always Free</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No subscription, no hidden costs, forever
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
