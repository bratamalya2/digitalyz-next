import * as XLSX from 'xlsx';

/**
 * Reads an Excel file and extracts data from specified sheets
 * @param {File} file - The Excel file to read
 * @returns {Promise<Object>} - Object containing data from each sheet
 */
export const readExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Extract data from specific sheets
        const clientData = extractSheetData(workbook, 'Clients 1');
        const workerData = extractSheetData(workbook, 'Worker 1');
        const taskData = extractSheetData(workbook, 'Tasks 1');
        
        resolve({ clientData, workerData, taskData });
      } catch (error) {
        reject(new Error(`Error parsing Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading the file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Extracts data from a specific sheet in the workbook
 * @param {Object} workbook - XLSX workbook object
 * @param {string} sheetName - Name of the sheet to extract
 * @returns {Array} - Array of objects representing rows in the sheet
 */
const extractSheetData = (workbook, sheetName) => {
  if (!workbook.SheetNames.includes(sheetName)) {
    console.warn(`Sheet "${sheetName}" not found in workbook`);
    return [];
  }
  
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  if (rawData.length < 2) {
    return [];
  }
  
  // First row is headers
  const headers = rawData[0];
  
  // Process each row into an object
  return rawData.slice(1).map((row, index) => {
    const rowData = {};
    
    headers.forEach((header, i) => {
      if (header) {
        // Handle different data types based on the column
        let value = row[i];
        
        // Parse arrays stored as comma-separated strings
        if (value && typeof value === 'string' && 
            (header.includes('IDs') || 
             header === 'Skills' || 
             header === 'RequiredSkills' || 
             header === 'PreferredPhases' || 
             header === 'AvailableSlots')) {
          try {
            // Check if it's a JSON string
            if (value.startsWith('[') && value.endsWith(']')) {
              value = JSON.parse(value);
            } else {
              // Otherwise treat as comma-separated values
              value = value.split(',').map(item => item.trim());
            }
          } catch (e) {
            // If parsing fails, keep as string
            console.warn(`Failed to parse array value for ${header}: ${value}`);
          }
        }
        
        // Parse JSON strings
        if (value && typeof value === 'string' && header === 'AttributesJSON') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.warn(`Failed to parse JSON value for ${header}: ${value}`);
          }
        }
        
        rowData[header] = value;
      }
    });
    
    // Add row index for reference
    rowData._rowIndex = index;
    
    return rowData;
  });
};

/**
 * Converts data to Excel format and triggers download
 * @param {Object} data - Object containing data for each sheet
 * @param {string} filename - Name for the downloaded file
 */
export const exportToExcel = (data, filename = 'exported-data.xlsx') => {
  const workbook = XLSX.utils.book_new();
  
  // Add each data set as a separate sheet
  if (data.clientData && data.clientData.length > 0) {
    const clientSheet = XLSX.utils.json_to_sheet(data.clientData);
    XLSX.utils.book_append_sheet(workbook, clientSheet, 'Clients 1');
  }
  
  if (data.workerData && data.workerData.length > 0) {
    const workerSheet = XLSX.utils.json_to_sheet(data.workerData);
    XLSX.utils.book_append_sheet(workbook, workerSheet, 'Worker 1');
  }
  
  if (data.taskData && data.taskData.length > 0) {
    const taskSheet = XLSX.utils.json_to_sheet(data.taskData);
    XLSX.utils.book_append_sheet(workbook, taskSheet, 'Tasks 1');
  }
  
  // Generate and download the file
  XLSX.writeFile(workbook, filename);
};