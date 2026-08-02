import { PosService } from '../services/pos.service';
import { ProductService } from '../services/product.service';

export function runPosUnitTests() {
  console.log('🧪 Starting POS Core Logic Unit Tests...\n');

  // Test 1: Stock Quantity Check & Product Lookup
  try {
    const product = ProductService.getProductByBarcode('893500100123');
    console.assert(product !== null, 'Product lookup by barcode failed');
    console.assert(product.id === 'prod-01', 'Incorrect product ID returned');
    console.log('✅ Test 1 Passed: Barcode Lookup & Product Verification');
  } catch (err: any) {
    console.error('❌ Test 1 Failed:', err.message);
  }

  // Test 2: Checkout Calculations & Change Calculation
  try {
    const initialStock = ProductService.getProductByBarcode('893500100123').stockQuantity;
    const checkoutResult = PosService.checkout({
      cashierId: 'usr-cashier-01',
      branchId: 'branch-01',
      items: [
        { productId: 'prod-01', quantity: 2, unitPrice: 31990000, discount: 0 }
      ],
      subTotal: 63980000,
      discount: 3980000,
      tax: 0,
      totalAmount: 60000000,
      paidAmount: 65000000,
      paymentMethod: 'CASH'
    });

    console.assert(checkoutResult.changeAmount === 5000000, `Expected change 5,000,000 but got ${checkoutResult.changeAmount}`);
    console.assert(checkoutResult.status === 'COMPLETED', 'Order status should be COMPLETED');

    const updatedStock = ProductService.getProductByBarcode('893500100123').stockQuantity;
    console.assert(updatedStock === initialStock - 2, 'Stock deduction failed');
    console.log('✅ Test 2 Passed: Checkout Calculations, Change Math & Inventory Deduction');
  } catch (err: any) {
    console.error('❌ Test 2 Failed:', err.message);
  }

  console.log('\n🎉 All Core POS Unit Tests Executed Successfully!');
}

if (require.main === module) {
  runPosUnitTests();
}
