import { Router, Request, Response } from 'express';
import {
  getAllStockAudits,
  getStockAuditById,
  createStockAudit,
  updateStockAudit,
  completeStockAudit,
  mergeStockAudits,
  cancelStockAudit,
} from '../services/stock-audit.service';

const router = Router();

// GET /api/v1/stock-audits
router.get('/', (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const list = getAllStockAudits(branchId, status, search);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/stock-audits/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const audit = getStockAuditById(req.params.id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Phiếu kiểm kho' });
    }
    res.json({ success: true, data: audit });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/stock-audits
router.post('/', (req: Request, res: Response) => {
  try {
    const newAudit = createStockAudit(req.body);
    res.status(201).json({ success: true, data: newAudit });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/v1/stock-audits/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = updateStockAudit(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/stock-audits/:id/complete (Cân bằng kho)
router.post('/:id/complete', (req: Request, res: Response) => {
  try {
    const userRole = req.body.userRole || 'STAFF';
    const completed = completeStockAudit(req.params.id, userRole);
    res.json({ success: true, data: completed });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/stock-audits/merge (Gộp phiếu tạm)
router.post('/merge', (req: Request, res: Response) => {
  try {
    const { auditIds, userRole, creatorName } = req.body;
    const merged = mergeStockAudits(auditIds, userRole || 'STAFF', creatorName || 'Quản lý');
    res.json({ success: true, data: merged });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/v1/stock-audits/:id/cancel (Hủy phiếu kiểm)
router.post('/:id/cancel', (req: Request, res: Response) => {
  try {
    const { userRole, reason } = req.body;
    const cancelled = cancelStockAudit(req.params.id, userRole || 'STAFF', reason);
    res.json({ success: true, data: cancelled });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
