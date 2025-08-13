'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const ClientGrid = ({ data, onDataChange }) => {
  const gridRef = useRef();
  const [rowData, setRowData] = useState([]);
  
  useEffect(() => {
    if (data && data.length > 0) {
      setRowData(data);
    }
  }, [data]);

  // Column definitions
  const [columnDefs] = useState([
    { field: 'ClientID', headerName: 'Client ID', editable: true },
    { field: 'ClientName', headerName: 'Client Name', editable: true },
    { 
      field: 'PriorityLevel', 
      headerName: 'Priority Level', 
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 1,
        max: 5
      },
      valueFormatter: params => {
        return params.value ? params.value : '';
      }
    },
    { 
      field: 'RequestedTaskIDs', 
      headerName: 'Requested Task IDs', 
      editable: true,
      valueFormatter: params => {
        return Array.isArray(params.value) ? params.value.join(', ') : params.value;
      },
      valueSetter: params => {
        if (params.newValue === '') {
          params.data.RequestedTaskIDs = [];
          return true;
        }
        params.data.RequestedTaskIDs = params.newValue.split(',').map(id => id.trim());
        return true;
      }
    },
    { field: 'GroupTag', headerName: 'Group Tag', editable: true },
    { 
      field: 'AttributesJSON', 
      headerName: 'Attributes JSON', 
      editable: true,
      valueFormatter: params => {
        return typeof params.value === 'object' ? JSON.stringify(params.value) : params.value;
      },
      valueSetter: params => {
        try {
          if (params.newValue === '') {
            params.data.AttributesJSON = {};
            return true;
          }
          params.data.AttributesJSON = JSON.parse(params.newValue);
          return true;
        } catch (error) {
          console.error('Invalid JSON format:', error);
          return false;
        }
      }
    }
  ]);

  // Default column settings
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100
  };

  // Cell value changed handler
  const onCellValueChanged = useCallback((params) => {
    const updatedData = [...rowData];
    onDataChange(updatedData);
  }, [rowData, onDataChange]);

  // Add new row handler
  const addNewRow = useCallback(() => {
    const newRow = {
      ClientID: `C${rowData.length + 1}`,
      ClientName: '',
      PriorityLevel: 1,
      RequestedTaskIDs: [],
      GroupTag: '',
      AttributesJSON: {}
    };
    
    setRowData([...rowData, newRow]);
    onDataChange([...rowData, newRow]);
  }, [rowData, onDataChange]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Clients</h2>
        <button 
          onClick={addNewRow}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Add Client
        </button>
      </div>
      
      <div className="flex-grow w-full ag-theme-alpine">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          onCellValueChanged={onCellValueChanged}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          suppressCellFocus={false}
          stopEditingWhenCellsLoseFocus={true}
        />
      </div>
    </div>
  );
};

export default ClientGrid;