import fs from 'fs';
import path from 'path';
import { SettingsService } from './settings.service';
import { ProductService } from './product.service';
import { BranchService } from './branch.service';
import { CustomerService } from './customer.service';
import { PriceListService } from './pricelist.service';

export interface BackupMeta {
  filename: string;
  version: string;
  exportedAt: string;
  triggerType: 'MANUAL' | 'SCHEDULED' | 'IMPORT';
  sizeBytes: number;
  sizeFormatted: string;
  summary: {
    totalProducts: number;
    totalBranches: number;
    totalCustomers: number;
    totalPriceLists: number;
    storeName: string;
  };
}

export interface BackupConfig {
  autoBackupEnabled: boolean;
  intervalHours: number;
  retentionDays: number;
  cloudSyncEnabled: boolean;
  cloudSyncProvider: 'GOOGLE_DRIVE' | 'TELEGRAM_BOT' | 'SIMULATED';
  cloudSyncDestination?: string;
  lastBackupAt?: string;
}

const BACKUP_DIR = path.resolve(__dirname, '../../backups');

let BACKUP_CONFIG: BackupConfig = {
  autoBackupEnabled: true,
  intervalHours: 24,
  retentionDays: 30,
  cloudSyncEnabled: true,
  cloudSyncProvider: 'TELEGRAM_BOT',
  cloudSyncDestination: 'Telegram Bot (Báo cáo tự động)',
  lastBackupAt: undefined,
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export class BackupService {
  private static schedulerInterval: NodeJS.Timeout | null = null;

  private static ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  static getBackupConfig(): BackupConfig {
    return { ...BACKUP_CONFIG };
  }

  static updateBackupConfig(config: Partial<BackupConfig>): BackupConfig {
    BACKUP_CONFIG = { ...BACKUP_CONFIG, ...config };
    return { ...BACKUP_CONFIG };
  }

  static createBackup(triggerType: 'MANUAL' | 'SCHEDULED' | 'IMPORT' = 'MANUAL'): BackupMeta {
    this.ensureBackupDir();

    const storeSettings = SettingsService.getSettings();
    const products = ProductService.getAllRawProducts();
    const masterCatalogs = ProductService.getRawMasterCatalogs();
    const branches = BranchService.getAllBranches();
    const customers = CustomerService.getCustomers();
    const priceLists = PriceListService.getAllPriceLists();

    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${triggerType.toLowerCase()}_${dateStr}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    const snapshot = {
      meta: {
        version: '2.0.0',
        exportedAt: now.toISOString(),
        appName: 'Sales Management System',
        triggerType,
        storeName: storeSettings.receiptHeader || 'Cửa hàng',
      },
      storeSettings,
      masterCatalogs: {
        ...masterCatalogs,
        imagePresets: SettingsService.getImagePresets(),
      },
      products,
      branches,
      customers,
      priceLists,
    };

    const content = JSON.stringify(snapshot, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');

    const stats = fs.statSync(filePath);
    BACKUP_CONFIG.lastBackupAt = now.toISOString();

    const meta: BackupMeta = {
      filename,
      version: '2.0.0',
      exportedAt: now.toISOString(),
      triggerType,
      sizeBytes: stats.size,
      sizeFormatted: formatBytes(stats.size),
      summary: {
        totalProducts: products.length,
        totalBranches: branches.length,
        totalCustomers: customers.length,
        totalPriceLists: priceLists.length,
        storeName: storeSettings.receiptHeader || 'Cửa hàng',
      },
    };

    // Auto purge backups older than retention limit
    this.cleanOldBackups();

    return meta;
  }

  static listBackups(): BackupMeta[] {
    this.ensureBackupDir();
    const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json'));

    const list: BackupMeta[] = [];

    for (const filename of files) {
      try {
        const filePath = path.join(BACKUP_DIR, filename);
        const stats = fs.statSync(filePath);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(raw);

        const meta: BackupMeta = {
          filename,
          version: json.meta?.version || '1.0.0',
          exportedAt: json.meta?.exportedAt || stats.mtime.toISOString(),
          triggerType: json.meta?.triggerType || 'MANUAL',
          sizeBytes: stats.size,
          sizeFormatted: formatBytes(stats.size),
          summary: {
            totalProducts: Array.isArray(json.products) ? json.products.length : 0,
            totalBranches: Array.isArray(json.branches) ? json.branches.length : 0,
            totalCustomers: Array.isArray(json.customers) ? json.customers.length : 0,
            totalPriceLists: Array.isArray(json.priceLists) ? json.priceLists.length : 0,
            storeName: json.storeSettings?.receiptHeader || json.meta?.storeName || 'Cửa hàng',
          },
        };

        list.push(meta);
      } catch (err) {
        console.warn(`Error reading backup file ${filename}:`, err);
      }
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.exportedAt).getTime() - new Date(a.exportedAt).getTime());
  }

  static getBackupFilePath(filename: string): string {
    this.ensureBackupDir();
    const safeName = path.basename(filename);
    const filePath = path.join(BACKUP_DIR, safeName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Không tìm thấy file bản sao lưu: ${safeName}`);
    }
    return filePath;
  }

  static restoreBackup(filename: string) {
    const filePath = this.getBackupFilePath(filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const snapshot = JSON.parse(raw);
    return this.restoreFromSnapshot(snapshot, `Khôi phục từ file ${filename}`);
  }

  static restoreFromSnapshot(snapshot: any, sourceDescription = 'Khôi phục từ file upload') {
    if (!snapshot || typeof snapshot !== 'object') {
      throw new Error('Dữ liệu file bản sao lưu không hợp lệ!');
    }

    // 1. Restore Store Settings & Master Catalogs
    SettingsService.importSystemBundle(snapshot);

    // 2. Restore Products
    if (snapshot.products && Array.isArray(snapshot.products)) {
      ProductService.setAllRawProducts(snapshot.products);
    }

    return {
      success: true,
      message: `Đã khôi phục thành công toàn bộ hệ thống (${sourceDescription})!`,
      restoredAt: new Date().toISOString(),
      summary: {
        totalProducts: Array.isArray(snapshot.products) ? snapshot.products.length : 0,
        totalBranches: Array.isArray(snapshot.branches) ? snapshot.branches.length : 0,
        totalCustomers: Array.isArray(snapshot.customers) ? snapshot.customers.length : 0,
      },
    };
  }

  static deleteBackup(filename: string) {
    const filePath = this.getBackupFilePath(filename);
    fs.unlinkSync(filePath);
    return { success: true, message: `Đã xóa file bản sao lưu ${filename}` };
  }

  static cleanOldBackups() {
    this.ensureBackupDir();
    const list = this.listBackups();

    // Retain maximum 30 backup files
    const maxRetentionCount = 30;
    if (list.length > maxRetentionCount) {
      const toDelete = list.slice(maxRetentionCount);
      for (const item of toDelete) {
        try {
          const p = path.join(BACKUP_DIR, item.filename);
          if (fs.existsSync(p)) fs.unlinkSync(p);
        } catch (e) {
          console.warn('Failed to purge old backup:', item.filename);
        }
      }
    }
  }

  static initScheduler() {
    if (this.schedulerInterval) return;

    // Check every hour if a scheduled auto backup is needed
    this.schedulerInterval = setInterval(() => {
      try {
        if (!BACKUP_CONFIG.autoBackupEnabled) return;

        const now = new Date().getTime();
        const lastBackupTime = BACKUP_CONFIG.lastBackupAt ? new Date(BACKUP_CONFIG.lastBackupAt).getTime() : 0;
        const intervalMs = (BACKUP_CONFIG.intervalHours || 24) * 60 * 60 * 1000;

        if (now - lastBackupTime >= intervalMs) {
          console.log('⏰ [AUTO-BACKUP] Running scheduled system backup...');
          const meta = this.createBackup('SCHEDULED');
          console.log(`✅ [AUTO-BACKUP] Created backup ${meta.filename} (${meta.sizeFormatted})`);
        }
      } catch (err: any) {
        console.error('❌ [AUTO-BACKUP] Error running scheduled backup:', err.message);
      }
    }, 3600 * 1000); // Check hourly

    console.log('🛡️ [BACKUP-SERVICE] Automated background backup scheduler initialized');
  }
}
