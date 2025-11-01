import React, { useState, useEffect } from 'react';
import { defaults } from '../../shared/defaults';
import './Options.css';

const Options: React.FC = () => {
  const [openInTab, setOpenInTab] = useState(false);
  const [download, setDownload] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [defaultExportFormat, setDefaultExportFormat] = useState<'png' | 'excel' | 'both'>('excel');
  const [batchCropsCount, setBatchCropsCount] = useState(0);

  // Load settings on mount
  useEffect(() => {
    chrome.storage.sync.get(['openInTab'], (result) => {
      if (result.openInTab === undefined) {
        chrome.storage.sync.set({ openInTab: defaults.openInTab });
      } else {
        setOpenInTab(result.openInTab);
      }
    });

    chrome.storage.sync.get(['download'], (result) => {
      if (result.download === undefined) {
        chrome.storage.sync.set({ download: defaults.download });
      } else {
        setDownload(result.download);
      }
    });

    chrome.storage.sync.get(['includeMetadata'], (result) => {
      if (result.includeMetadata === undefined) {
        chrome.storage.sync.set({ includeMetadata: true });
        setIncludeMetadata(true);
      } else {
        setIncludeMetadata(result.includeMetadata);
      }
    });

    chrome.storage.sync.get(['defaultExportFormat'], (result) => {
      if (result.defaultExportFormat === undefined) {
        chrome.storage.sync.set({ defaultExportFormat: 'excel' });
        setDefaultExportFormat('excel');
      } else {
        setDefaultExportFormat(result.defaultExportFormat);
      }
    });

    // Load batch crops count
    chrome.storage.local.get(['batchCrops'], (result) => {
      const crops = result.batchCrops || [];
      setBatchCropsCount(crops.length);
    });

    // Set up listener for batch crops changes
    const interval = setInterval(() => {
      chrome.storage.local.get(['batchCrops'], (result) => {
        const crops = result.batchCrops || [];
        setBatchCropsCount(crops.length);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const openInNewTabClickedHandler = (to: boolean) => {
    setOpenInTab(to);
    chrome.storage.sync.set({ openInTab: to });
  };

  const downloadClickedHandler = (to: boolean) => {
    setDownload(to);
    chrome.storage.sync.set({ download: to });
  };

  const includeMetadataClickedHandler = (to: boolean) => {
    setIncludeMetadata(to);
    chrome.storage.sync.set({ includeMetadata: to });
  };

  const defaultExportFormatChangeHandler = (format: string) => {
    setDefaultExportFormat(format as 'png' | 'excel' | 'both');
    chrome.storage.sync.set({ defaultExportFormat: format });
  };

  const clearBatchCropsHandler = () => {
    if (confirm('Are you sure you want to clear all stored crops?')) {
      chrome.storage.local.set({ batchCrops: [] });
      setBatchCropsCount(0);
    }
  };

  const exportBatchHandler = () => {
    if (batchCropsCount === 0) {
      alert('No crops to export. Capture some screenshots first.');
      return;
    }

    chrome.runtime.sendMessage(
      {
        msg: 'BATCH_EXPORT_EXCEL',
        includeMetadata,
        filename: `batch_export_${Date.now()}.xlsx`
      },
      (response) => {
        if (response.success) {
          alert(`Successfully exported ${batchCropsCount} crops to Excel!`);
          setBatchCropsCount(0);
        } else {
          alert(`Export failed: ${response.message}`);
        }
      }
    );
  };

  return (
    <div className="OptionsContainer">
      <h2>Screenshot Settings</h2>

      <div className="SettingsSection">
        <h3>Output Options</h3>
        <div className="OptionEntry">
          <input
            type="checkbox"
            id="openInTab"
            name="openInTab"
            checked={openInTab}
            onChange={() => openInNewTabClickedHandler(!openInTab)}
          />
          <label htmlFor="openInTab">Open screenshots in a new tab</label>
        </div>

        <div className="OptionEntry">
          <input
            type="checkbox"
            id="download"
            name="download"
            checked={download}
            onChange={() => downloadClickedHandler(!download)}
          />
          <label htmlFor="download">Directly download screenshots</label>
        </div>
      </div>

      <div className="SettingsSection">
        <h3>Excel Export Options</h3>

        <div className="OptionEntry">
          <input
            type="checkbox"
            id="includeMetadata"
            name="includeMetadata"
            checked={includeMetadata}
            onChange={() => includeMetadataClickedHandler(!includeMetadata)}
          />
          <label htmlFor="includeMetadata">Include metadata in Excel (URL, timestamp, dimensions)</label>
        </div>

        <div className="OptionEntry">
          <label htmlFor="exportFormat">Default export format:</label>
          <select
            id="exportFormat"
            value={defaultExportFormat}
            onChange={(e) => defaultExportFormatChangeHandler(e.target.value)}
            style={{ marginLeft: '8px', padding: '4px 8px' }}
          >
            <option value="png">PNG (Image only)</option>
            <option value="excel">Excel (Default)</option>
            <option value="both">Both PNG & Excel</option>
          </select>
        </div>
      </div>

      <div className="SettingsSection">
        <h3>Batch Export</h3>
        <div className="BatchCropsInfo">
          <p>Stored crops: <strong>{batchCropsCount}</strong></p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Crops are automatically saved when you use Alt+Drag to capture.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={exportBatchHandler}
            style={{
              padding: '8px 16px',
              backgroundColor: batchCropsCount > 0 ? '#3b82f6' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: batchCropsCount > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
            disabled={batchCropsCount === 0}
          >
            Export Batch to Excel
          </button>

          <button
            onClick={clearBatchCropsHandler}
            style={{
              padding: '8px 16px',
              backgroundColor: batchCropsCount > 0 ? '#ef4444' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: batchCropsCount > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
            disabled={batchCropsCount === 0}
          >
            Clear Crops
          </button>
        </div>
      </div>

      <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '12px', color: '#666' }}>
        <strong>How to use:</strong>
        <ul style={{ marginTop: '8px', marginBottom: '0px', paddingLeft: '20px' }}>
          <li>Hold Alt/Option key and drag to select an area for crop</li>
          <li>Click the extension icon for full-page screenshots</li>
          <li>Crops are automatically stored for batch export</li>
          <li>Use batch export to combine multiple crops into one Excel file</li>
        </ul>
      </div>
    </div>
  );
};

export default Options;
