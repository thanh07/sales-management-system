import React, { useEffect } from 'react';
import { ProductGrid } from '../components/pos/ProductGrid';
import { CartDrawer } from '../components/pos/CartDrawer';
import { MobilePOSView } from '../components/pos/MobilePOSView';
import { ThermalInvoiceModal } from '../components/pos/ThermalInvoiceModal';
import { ParkedOrdersModal } from '../components/pos/ParkedOrdersModal';
import { CustomerSelectModal } from '../components/pos/CustomerSelectModal';
import { PriceListSelectModal } from '../components/pos/PriceListSelectModal';
import { CheckoutModal } from '../components/pos/CheckoutModal';
import { OrderHistoryModal } from '../components/pos/OrderHistoryModal';
import { usePosStore } from '../store/posStore';

import { DeliveryModal } from '../components/pos/DeliveryModal';
import { DeliveryLogModal } from '../components/pos/DeliveryLogModal';

interface POSPageProps {
  onOpenMobileMenu?: () => void;
}

export const POSPage: React.FC<POSPageProps> = ({ onOpenMobileMenu }) => {
  const {
    parkCurrentOrder,
    clearCart,
    setInvoiceModalOpen,
    isCustomerModalOpen,
    setCustomerModalOpen,
    isPriceListModalOpen,
    setPriceListModalOpen,
    isCheckoutModalOpen,
    setCheckoutModalOpen,
    isOrderHistoryModalOpen,
    setOrderHistoryModalOpen,
    setDeliveryModalOpen,
    setDeliveryLogModalOpen,
    addTab,
    closeTab,
    activeTabId,
    tabs,
  } = usePosStore();

  // Listen to Keyboard Shortcuts (F1, F3, F4, F7, F8, F9, F10, F12, Ctrl+T, Ctrl+W)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        setPriceListModalOpen(true);
      } else if (e.key === 'F6') {
        e.preventDefault();
        setDeliveryModalOpen(true);
      } else if (e.key === 'F7') {
        e.preventDefault();
        setOrderHistoryModalOpen(true);
      } else if (e.key === 'F8') {
        e.preventDefault();
        await parkCurrentOrder();
      } else if (e.key === 'F9') {
        e.preventDefault();
        setCheckoutModalOpen(true);
      } else if (e.key === 'F10') {
        e.preventDefault();
        clearCart();
      } else if (e.key === 'F12') {
        e.preventDefault();
        setInvoiceModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        addTab();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w' && tabs.length > 1) {
        e.preventDefault();
        closeTab(activeTabId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [parkCurrentOrder, clearCart, setInvoiceModalOpen, setCustomerModalOpen, setPriceListModalOpen, setCheckoutModalOpen, setOrderHistoryModalOpen, setDeliveryModalOpen, addTab, closeTab, activeTabId, tabs]);

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-slate-950 w-full relative">
      {/* Mobile Responsive POS View (Visible on screens < md) */}
      <div className="block md:hidden h-full w-full">
        <MobilePOSView onOpenMobileMenu={onOpenMobileMenu} />
      </div>

      {/* Desktop 2-Column POS View (Visible on screens >= md) */}
      <div className="hidden md:flex h-full w-full">
        <ProductGrid />
        <CartDrawer />
      </div>

      {/* Shared Modals */}
      <ThermalInvoiceModal />
      <ParkedOrdersModal />
      <CustomerSelectModal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)} />
      <PriceListSelectModal isOpen={isPriceListModalOpen} onClose={() => setPriceListModalOpen(false)} />
      <CheckoutModal isOpen={isCheckoutModalOpen} onClose={() => setCheckoutModalOpen(false)} />
      <OrderHistoryModal isOpen={isOrderHistoryModalOpen} onClose={() => setOrderHistoryModalOpen(false)} />
      <DeliveryModal />
      <DeliveryLogModal />
    </div>
  );
};

export default POSPage;
