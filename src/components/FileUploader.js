'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const FileUploader = ({ onDataLoaded }) => {
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setError('');

    try {
      const data = await readExcelFile(file);
      onDataLoaded(data);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read Excel file. Please make sure it has the correct format.');
    } finally {
      setLoading(false);
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Check if required sheets exist
          const requiredSheets = ['Clients 1', 'Worker 1', 'Tasks 1'];
          const missingSheets = requiredSheets.filter(sheet => !workbook.SheetNames.includes(sheet));
          
          if (missingSheets.length > 0) {
            reject(`Missing required sheets: ${missingSheets.join(', ')}`);
            return;
          }
          
          // Process each sheet
          const clientData = XLSX.utils.sheet_to_json(workbook.Sheets['Clients 1']);
          const workerData = XLSX.utils.sheet_to_json(workbook.Sheets['Worker 1']);
          const taskData = XLSX.utils.sheet_to_json(workbook.Sheets['Tasks 1']);
          
          // Validate and process the data
          const processedData = {
            clientData: processClientData(clientData),
            workerData: processWorkerData(workerData),
            taskData: processTaskData(taskData)
          };
          
          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Process and validate client data
  const processClientData = (data) => {
    return data.map(client => ({
      ...client,
      PriorityLevel: parseInt(client.PriorityLevel) || 1,
      RequestedTaskIDs: client.RequestedTaskIDs ? client.RequestedTaskIDs.split(',').map(id => id.trim()) : [],
      AttributesJSON: client.AttributesJSON ? JSON.parse(client.AttributesJSON) : {}
    }));
  };

  // Process and validate worker data
  const processWorkerData = (data) => {
    return data.map(worker => ({
      ...worker,
      Skills: worker.Skills ? worker.Skills.split(',').map(skill => skill.trim()) : [],
      AvailableSlots: parseSlots(worker.AvailableSlots),
      MaxLoadPerPhase: parseInt(worker.MaxLoadPerPhase) || 1
    }));
  };

  // Process and validate task data
  const processTaskData = (data) => {
    return data.map(task => ({
      ...task,
      Duration: parseInt(task.Duration) || 1,
      RequiredSkills: task.RequiredSkills ? task.RequiredSkills.split(',').map(skill => skill.trim()) : [],
      PreferredPhases: parsePreferredPhases(task.PreferredPhases),
      MaxConcurrent: parseInt(task.MaxConcurrent) || 1
    }));
  };

  // Parse available slots from string to array
  const parseSlots = (slotsStr) => {
    if (!slotsStr) return [];
    
    try {
      // Handle array notation [1,3,5]
      if (slotsStr.startsWith('[') && slotsStr.endsWith(']')) {
        // Strip brackets and parse as comma-separated values
        const content = slotsStr.slice(1, -1).trim();
        if (!content) return [];
        return content.split(',').map(slot => parseInt(slot.trim())).filter(slot => !isNaN(slot));
      }
      
      // Handle comma-separated values
      return slotsStr.split(',').map(slot => parseInt(slot.trim()));
    } catch (error) {
      console.error('Error parsing slots:', error);
      return [];
    }
  };

  // Parse preferred phases from string to array
  const parsePreferredPhases = (phasesStr) => {
    if (!phasesStr) return [];
    
    try {
      // Handle array notation [2,4,5]
      if (phasesStr.startsWith('[') && phasesStr.endsWith(']')) {
        // Strip brackets and parse as comma-separated values
        const content = phasesStr.slice(1, -1).trim();
        if (!content) return [];
        return content.split(',').map(phase => parseInt(phase.trim())).filter(phase => !isNaN(phase));
      }
      
      // Handle range notation "1-3"
      if (phasesStr.includes('-')) {
        const [start, end] = phasesStr.split('-').map(num => parseInt(num.trim()));
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
      
      // Handle comma-separated values
      return phasesStr.split(',').map(phase => parseInt(phase.trim()));
    } catch (error) {
      console.error('Error parsing preferred phases:', error);
      return [];
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="hidden"
        />
        <button
          onClick={handleButtonClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Upload Excel File'}
        </button>
        {fileName && <p className="mt-2 text-sm text-gray-600">Selected: {fileName}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default FileUploader;