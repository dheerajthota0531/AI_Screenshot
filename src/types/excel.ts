/**
 * TypeScript types for Excel export operations
 */

export interface CropData {
  dataUrl: string;
  timestamp: number;
  pageUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ExcelExportOptions {
  includeMetadata: boolean;
  filename?: string;
  timestamp?: number;
}

export interface ExcelMetadata {
  captureTime: string;
  pageUrl: string;
  width: number;
  height: number;
  cropCoordinates: {
    x: number;
    y: number;
  };
}

export type ExportFormat = 'png' | 'excel' | 'both';
