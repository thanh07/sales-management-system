import React, { useEffect } from 'react';
import { ProductGrid } from '../components/pos/ProductGrid';
import { CartDrawer } from '../components/pos/CartDrawer';
import { ThermalInvoiceModal } from '../components/pos/ThermalInvoiceModal';
import { ParkedOrdersModal } from '../components/pos/ParkedOrdersModal';
import { CustomerSelectModal } from '../components/pos/CustomerSelectModal';
import { usePosStore } from '../store/posStore';

export const POSPage: React.FC = () => {
  const {
    checkout,
    parkCurrentOrder,
    clearCart,
    setInvoiceModalOpen,
    isCustomerModalOpen,
    setCustomerModalOpen,
    setPriceListModalOpen,
  } = usePosStore();

  // Listen to Keyboard Shortcuts (F1, F3, F4, F8, F9, F10, F12)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        setPriceListModalOpen(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        setCustomerModalOpen(true);
      } else if (e.key === 'F8') {
        e.preventDefault();
        await parkCurrentOrder();
      } else if (e.key === 'F9') {
        e.preventDefault();
        try {
          await checkout();
        } catch (err: any) {
          alert(err.message || 'Chưa chọn sản phẩm thanh toán');
        }
      } else if (e.key === 'F10') {
        e.preventDefault();
        clearCart();
      } else if (e.key === 'F12') {
        e.preventDefault();
        setInvoiceModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [checkout, parkCurrentOrder, clearCart, setInvoiceModalOpen, setCustomerModalOpen, setPriceListModalOpen]);

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-slate-950">
      {/* Products & Barcode Area */}
      <ProductGrid />

      {/* Checkout Cart Drawer */}
      <CartDrawer />

      {/* Modals */}
      <ThermalInvoiceModal />
      <ParkedOrdersModal />
      <CustomerSelectModal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)} />
    </div>
  );
};

export default POSPage;
