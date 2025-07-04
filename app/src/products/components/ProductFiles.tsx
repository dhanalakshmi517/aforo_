import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Button, CircularProgress } from '@mui/material';
import { Description, Download, Delete } from '@mui/icons-material';
import { productApi, ProductFileResponse } from '../../services/api';
import '../styles/ProductFiles.css';
import { showSuccessAlert, showErrorAlert, showConfirmationDialog, showLoadingAlert, closeAlert } from '../../utils/sweetAlert';

interface ProductFilesProps {
  productId: number;
  fileType?: 'SAMPLE_FILE' | 'DOCUMENTATION';
}

const ProductFiles: React.FC<ProductFilesProps> = ({ productId, fileType }) => {
  const [files, setFiles] = useState<ProductFileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let allFiles: ProductFileResponse[] = [];
      
      if (fileType) {
        // Fetch only the specified file type
        const fetchedFiles = await productApi.getProductFiles(productId, fileType);
        allFiles = fetchedFiles;
      } else {
        // Fetch both types of files
        const [sampleFiles, docFiles] = await Promise.all([
          productApi.getProductFiles(productId, 'SAMPLE_FILE'),
          productApi.getProductFiles(productId, 'DOCUMENTATION')
        ]);
        
        allFiles = [...sampleFiles, ...docFiles];
      }
      
      setFiles(allFiles);
    } catch (err) {
      console.error('Error fetching product files:', err);
      const errorMessage = `Failed to fetch files: ${err instanceof Error ? err.message : String(err)}`;
      showErrorAlert('Fetch Failed', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchFiles();
    }
  }, [productId, fileType]);

  const handleDownload = (file: ProductFileResponse) => {
    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = file.downloadUrl;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show a success message
    showSuccessAlert('Download Started', `${file.fileName} is being downloaded.`, 1500);
  };

  const handleDelete = async (fileId: number) => {
    // Use SweetAlert2 for confirmation
    const result = await showConfirmationDialog(
      'Delete File',
      'Are you sure you want to delete this file? This action cannot be undone.',
      'Yes, delete it',
      'Cancel',
      'warning'
    );
    
    if (!result.isConfirmed) {
      return;
    }
    
    setDeleteLoading(fileId);
    setError(null);
    
    try {
      showLoadingAlert('Deleting File', 'Please wait...');
      await productApi.deleteProductFile(fileId);
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      closeAlert();
      showSuccessAlert('File Deleted', 'The file has been deleted successfully.', 2000);
    } catch (err) {
      console.error('Error deleting file:', err);
      closeAlert();
      const errorMessage = `Failed to delete file: ${err instanceof Error ? err.message : String(err)}`;
      showErrorAlert('Deletion Failed', errorMessage);
      setError(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  if (files.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No files uploaded yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="product-files-container">
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {error}
          </Typography>
        </Box>
      )}
      
      <List>
        {files.map((file) => (
          <ListItem 
            key={file.id} 
            className="file-item"
            secondaryAction={
              <Box>
                <Button
                  startIcon={<Download />}
                  onClick={() => handleDownload(file)}
                  size="small"
                  color="primary"
                >
                  Download
                </Button>
                <Button
                  startIcon={deleteLoading === file.id ? <CircularProgress size={16} /> : <Delete />}
                  onClick={() => handleDelete(file.id)}
                  size="small"
                  color="error"
                  disabled={deleteLoading === file.id}
                >
                  Delete
                </Button>
              </Box>
            }
          >
            <ListItemIcon>
              <Description />
            </ListItemIcon>
            <ListItemText 
              primary={file.fileName} 
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.primary">
                    {file.fileType === 'SAMPLE_FILE' ? 'Sample File' : 'Documentation'}
                  </Typography>
                  {` — ${formatFileSize(file.size)} • ${new Date(file.createdAt).toLocaleDateString()}`}
                </React.Fragment>
              } 
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ProductFiles;
