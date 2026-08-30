import { Router, Request, Response } from 'express';
import {
  getAllPurchaseRequests,
  getPurchaseRequestById,
  createPurchaseRequest,
  depositPurchaseRequest,
  cancelPurchaseRequest,
  convertPurchaseRequestToOrder,
  getDepositLogs,
} from '../services/purchase-request.service';

const router = Router();

// GET /api/v1/purchase-requests
router.get('/', (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const list = getAllPurchaseRequests(branchId, status, search);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/purchase-requests/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const pr = getPurchaseRequestById(req.params.id);
    if (!pr) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Đơn đặt hàng nhập' });
    }
    res.json({ success: true, data: pr });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/purchase-requests/:id/deposits
router.get('/:id/deposits', (req: Request, res: Response) => {
  try {
    const logs = getDepositLogs(req.params.id);
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/purchase-requests
router.post('/', (req: Request, res: Response) => {
  try {
    const newPR = createPurchaseRequest(req.body);
    res.status(201).json({ success: true, data: newPR });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/purchase-requests/:id/deposit
router.post('/:id/deposit', (req: Request, res: Response) => {
  try {
    const updated = depositPurchaseRequest(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/purchase-requests/:id/convert-to-import
router.post('/:id/convert-to-import', (req: Request, res: Response) => {
  try {
    const result = convertPurchaseRequestToOrder(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/purchase-requests/:id/cancel
router.post('/:id/cancel', (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const cancelled = cancelPurchaseRequest(req.params.id, reason);
    res.json({ success: true, data: cancelled });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
