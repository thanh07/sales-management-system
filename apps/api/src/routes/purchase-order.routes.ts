import {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  completePurchaseOrder,
  cancelPurchaseOrder,
  createPurchaseReturn,
} from '../services/purchase-order.service';

const router = Router();

// GET /api/v1/purchase-orders
router.get('/', (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const list = getAllPurchaseOrders(branchId, status, search);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/purchase-orders/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const po = getPurchaseOrderById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Phiếu nhập kho' });
    }
    res.json({ success: true, data: po });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/purchase-orders
router.post('/', (req: Request, res: Response) => {
  try {
    const newPO = createPurchaseOrder(req.body);
    res.status(201).json({ success: true, data: newPO });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/purchase-orders/:id/complete
router.post('/:id/complete', (req: Request, res: Response) => {
  try {
    const po = completePurchaseOrder(req.params.id);
    res.json({ success: true, data: po });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/purchase-orders/:id/cancel (Hủy phiếu nhập kho)
router.post('/:id/cancel', (req: Request, res: Response) => {
  try {
    const { userRole, reason } = req.body;
    const cancelled = cancelPurchaseOrder(req.params.id, userRole || 'STAFF', reason);
    res.json({ success: true, data: cancelled });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/purchase-orders/:id/return (Trả hàng nhập cho NCC)
router.post('/:id/return', (req: Request, res: Response) => {
  try {
    const result = createPurchaseReturn(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
