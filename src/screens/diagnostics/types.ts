import type { ThemeVariant } from '../../theme/themeVariant';

export type DiagnosticStatus = 'ok' | 'warning' | 'error' | 'info';

export interface DiagnosticEntry {
  label: string;
  value: string;
  status: DiagnosticStatus;
}

export type BackupImportMode = 'overwrite' | 'merge';

export type BackupPayload = {
  schema: 'spark-backup-v1';
  exportedAt: string;
  app: 'spark-adhd';
  data: Record<string, string | null>;
};

export type ThemeOption = {
  variant: ThemeVariant;
  label: string;
  description: string;
  preview: {
    background: string;
    accent: string;
  };
  selected: boolean;
};
