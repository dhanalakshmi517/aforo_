import React, { useState, useRef } from 'react';
import { Box, Typography, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { productApi } from '../../services/api';

interface ProductTechnicalDetailsProps {
  productId: number | null;
  onFileChange?: (file: File | null) => void;
}

const ProductTechnicalDetails: React.FC<ProductTechnicalDetailsProps> = ({ 
  productId,
  onFileChange
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      await productApi.uploadProductFile(productId, selectedFile, 'SAMPLE_FILE');
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
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Upload Sample Files
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload sample files that demonstrate how to use this product.
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

export default ProductTechnicalDetails;
