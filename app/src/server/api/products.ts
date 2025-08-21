import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// Delete a product
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find and delete the product
    const deletedProduct = await prisma.product.delete({
      where: { id: parseInt(productId) }
    });

    res.json(deletedProduct);
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

  // Check if product name is unique
  router.get('/check-name/:productName', async (req, res) => {
    try {
      const { productName } = req.params;
      const existingProduct = await prisma.product.findFirst({
        where: { productName: productName }
      });
      
      res.json({ exists: !!existingProduct });
    } catch (error) {
      console.error('Error checking product name:', error);
      res.status(500).json({ error: 'Failed to check product name' });
    }
  });

  export default router;
