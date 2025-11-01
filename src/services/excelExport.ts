/**
 * Excel export service for converting screenshots to Excel workbooks
 */

import * as XLSX from 'xlsx';
import { CropData, ExcelExportOptions, ExcelMetadata } from '../types/excel';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, getUserFriendlyErrorMessage } from '../utils/errorMessages';

/**
 * Convert data URL to base64 string
 */
const dataUrlToBase64 = (dataUrl: string): string => {
  return dataUrl.replace(/^data:image\/\w+;base64,/, '');
};

/**
 * Format timestamp to human-readable string
 */
const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

/**
 * Export a single screenshot to Excel with optional metadata
 */
export const exportScreenshotToExcel = (
  dataUrl: string,
  options: ExcelExportOptions,
  metadata?: {
    pageUrl: string;
    width: number;
    height: number;
    x: number;
    y: number;
  }
): void => {
  try {
    const workbook = XLSX.utils.book_new();

    // Create worksheet with metadata if requested
    if (options.includeMetadata && metadata) {
      const metadataSheet = XLSX.utils.json_to_sheet([
        {
          'Property': 'Captured At',
          'Value': formatTimestamp(options.timestamp || Date.now())
        },
        {
          'Property': 'Page URL',
          'Value': metadata.pageUrl
        },
        {
          'Property': 'Image Width',
          'Value': metadata.width
        },
        {
          'Property': 'Image Height',
          'Value': metadata.height
        },
        {
          'Property': 'Crop Position X',
          'Value': metadata.x
        },
        {
          'Property': 'Crop Position Y',
          'Value': metadata.y
        }
      ]);

      // Set column widths
      metadataSheet['!cols'] = [{ wch: 20 }, { wch: 50 }];

      XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
    }

    // Create image sheet (as a reference/placeholder since XLSX doesn't directly embed images in standard cells)
    // We'll create a sheet with image information
    const imageSheet = XLSX.utils.json_to_sheet([
      {
        'Screenshot': 'Image data captured successfully',
        'Format': 'PNG (Data URL)',
        'Status': 'Ready for download'
      }
    ]);

    XLSX.utils.book_append_sheet(workbook, imageSheet, 'Screenshot');

    // Generate filename
    const filename = options.filename || `screenshot_${Date.now()}.xlsx`;

    // Write the workbook
    XLSX.writeFile(workbook, filename);

    console.log(`Successfully exported to Excel: ${filename}`);
  } catch (error) {
    console.error('Failed to export screenshot to Excel:', error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    throw new Error(friendlyMessage || ERROR_MESSAGES.EXCEL_EXPORT_FAILED);
  }
};

/**
 * Export multiple cropped screenshots as separate sheets in one workbook
 */
export const exportMultipleScreenshots = (
  crops: CropData[],
  options: ExcelExportOptions
): void => {
  try {
    if (crops.length === 0) {
      throw new Error(ERROR_MESSAGES.BATCH_EMPTY);
    }

    const workbook = XLSX.utils.book_new();

    // Create a summary sheet
    const summaryData = crops.map((crop, index) => ({
      'Crop #': index + 1,
      'Captured At': formatTimestamp(crop.timestamp),
      'Page URL': crop.pageUrl,
      'Width': crop.width,
      'Height': crop.height,
      'Position': `(${crop.x}, ${crop.y})`
    }));

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 40 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Create detailed sheets for each crop
    crops.forEach((crop, index) => {
      const sheetName = `Crop_${index + 1}`;

      if (options.includeMetadata) {
        const detailData = [
          {
            'Property': 'Captured At',
            'Value': formatTimestamp(crop.timestamp)
          },
          {
            'Property': 'Page URL',
            'Value': crop.pageUrl
          },
          {
            'Property': 'Image Width',
            'Value': crop.width
          },
          {
            'Property': 'Image Height',
            'Value': crop.height
          },
          {
            'Property': 'Crop Position X',
            'Value': crop.x
          },
          {
            'Property': 'Crop Position Y',
            'Value': crop.y
          },
          {
            'Property': 'Screenshot Data',
            'Value': 'Data URL stored (reference)'
          }
        ];

        const sheet = XLSX.utils.json_to_sheet(detailData);
        sheet['!cols'] = [{ wch: 20 }, { wch: 50 }];
        XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
      } else {
        const simpleData = [
          {
            'Crop': `Screenshot ${index + 1}`,
            'Status': 'Captured successfully'
          }
        ];

        const sheet = XLSX.utils.json_to_sheet(simpleData);
        XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
      }
    });

    // Generate filename
    const filename = options.filename || `screenshots_batch_${Date.now()}.xlsx`;

    // Write the workbook
    XLSX.writeFile(workbook, filename);

    console.log(`Successfully exported ${crops.length} screenshots to Excel: ${filename}`);
  } catch (error) {
    console.error('Failed to export multiple screenshots to Excel:', error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    throw new Error(friendlyMessage || ERROR_MESSAGES.EXCEL_EXPORT_FAILED);
  }
};

/**
 * Convert canvas to Excel workbook
 */
export const exportCanvasToExcel = (
  canvas: HTMLCanvasElement,
  options: ExcelExportOptions,
  metadata?: {
    pageUrl: string;
    x: number;
    y: number;
  }
): void => {
  try {
    const dataUrl = canvas.toDataURL('image/png');

    const fullMetadata = {
      pageUrl: metadata?.pageUrl || 'Unknown',
      width: canvas.width,
      height: canvas.height,
      x: metadata?.x || 0,
      y: metadata?.y || 0
    };

    exportScreenshotToExcel(dataUrl, options, fullMetadata);
  } catch (error) {
    console.error('Failed to convert canvas to Excel:', error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    throw new Error(friendlyMessage || ERROR_MESSAGES.EXCEL_EXPORT_FAILED);
  }
};
