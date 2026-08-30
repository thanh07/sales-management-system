import { Router, Request, Response } from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  paySupplierDebt,
  adjustSupplierDebt,
  getSupplierPaymentLogs,
} from '../services/supplier.service';

const router = Router();

// GET /api/v1/suppliers
router.get('/', (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const group = req.query.group as string;
    const status = req.query.status as string;
    const list = getAllSuppliers(search, group, status);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/suppliers/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const s = getSupplierById(req.params.id);
    if (!s) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Nhà cung cấp' });
    }
    res.json({ success: true, data: s });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/suppliers/:id/payments
router.get('/:id/payments', (req: Request, res: Response) => {
  try {
    const logs = getSupplierPaymentLogs(req.params.id);
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/suppliers
router.post('/', (req: Request, res: Response) => {
  try {
    const newSupp = createSupplier(req.body);
    res.status(201).json({ success: true, data: newSupp });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/v1/suppliers/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = updateSupplier(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/v1/suppliers/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    deleteSupplier(req.params.id);
    res.json({ success: true, message: 'Xóa Nhà cung cấp thành công' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/suppliers/:id/pay-debt
router.post('/:id/pay-debt', (req: Request, res: Response) => {
  try {
    const result = paySupplierDebt(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/suppliers/:id/adjust-debt
router.post('/:id/adjust-debt', (req: Request, res: Response) => {
  try {
    const { newDebtAmount, note } = req.body;
    const updated = adjustSupplierDebt(req.params.id, newDebtAmount, note);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
