import React, { useState, useRef } from 'react';
import { Box, Typography, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { productApi } from '../../services/api';

interface ProductDocumentationProps {
  initialContent?: string;
  onChange: (content: string) => void;
  productId: number | null;
  onFileChange?: (file: File | null) => void;
}

const ProductDocumentation: React.FC<ProductDocumentationProps> = ({
  initialContent = '',
  onChange,
  productId,
  onFileChange
}) => {
  const [content, setContent] = useState(initialContent);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      if (onFileChange) {
        onFileChange(file);
      }
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!productId) {
      // If productId is null, we're in create mode, so just store the file
      // for later upload after product creation
      setSuccess('File selected for upload');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await productApi.uploadProductFile(productId, selectedFile, 'DOCUMENTATION');
      setSuccess('File uploaded successfully');
      setSelectedFile(null);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (onFileChange) {
        onFileChange(null);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(`Failed to upload file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Documentation Content
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Provide detailed documentation for your product. You can use Markdown formatting.
        </Typography>
        
        <TextField
          multiline
          rows={10}
          fullWidth
          variant="outlined"
          value={content}
          onChange={handleContentChange}
          placeholder="# Product Documentation
          
## Overview
Describe your product here.

## Getting Started
Provide instructions on how to get started.

## API Reference
Document your API endpoints if applicable."
          sx={{ mt: 2 }}
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Additional Documentation Files
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload additional documentation files such as PDFs, diagrams, or examples.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
            disabled={uploading}
          >
            Select File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            sx={{ ml: 2 }}
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
          
          {selectedFile && (
            <Typography variant="body2" sx={{ ml: 2 }}>
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProductDocumentation;
