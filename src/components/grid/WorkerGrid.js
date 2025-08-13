"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const WorkerGrid = ({ data, onDataChange }) => {
  const gridRef = useRef();
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setRowData(data);
    }
  }, [data]);

  // Column definitions
  const [columnDefs] = useState([
    { field: "WorkerID", headerName: "Worker ID", editable: true },
    { field: "WorkerName", headerName: "Worker Name", editable: true },
    {
      field: "Skills",
      headerName: "Skills",
      editable: true,
      valueFormatter: (params) => {
        return Array.isArray(params.value)
          ? params.value.join(", ")
          : params.value;
      },
      valueSetter: (params) => {
        if (params.newValue === "") {
          params.data.Skills = [];
          return true;
        }
        params.data.Skills = params.newValue
          .split(",")
          .map((skill) => skill.trim());
        return true;
      },
    },
    {
      field: "AvailableSlots",
      headerName: "Available Slots",
      editable: true,
      valueFormatter: (params) => {
        return Array.isArray(params.value)
          ? params.value.join(", ")
          : params.value;
      },
      valueSetter: (params) => {
        try {
          if (params.newValue === "") {
            params.data.AvailableSlots = [];
            return true;
          }

          // Handle array notation [1,3,5]
          if (
            params.newValue.startsWith("[") &&
            params.newValue.endsWith("]")
          ) {
            // Strip brackets and parse as comma-separated values
            const content = params.newValue.slice(1, -1).trim();
            if (!content) {
              params.data.AvailableSlots = [];
              return true;
            }
            params.data.AvailableSlots = content.split(',').map(slot => parseInt(slot.trim())).filter(slot => !isNaN(slot));
            return true;
          }

          // Handle comma-separated values
          params.data.AvailableSlots = params.newValue
            .split(",")
            .map((slot) => parseInt(slot.trim()));
          return true;
        } catch (error) {
          console.error("Error parsing available slots:", error);
          return false;
        }
      },
    },
    {
      field: "MaxLoadPerPhase",
      headerName: "Max Load Per Phase",
      editable: true,
      cellEditor: "agNumberCellEditor",
      valueFormatter: (params) => {
        return params.value ? params.value : "";
      },
    },
    { field: "WorkerGroup", headerName: "Worker Group", editable: true },
    {
      field: "QualificationLevel",
      headerName: "Qualification Level",
      editable: true,
    },
  ]);

  // Default column settings
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
  };

  // Cell value changed handler
  const onCellValueChanged = useCallback(
    (params) => {
      const updatedData = [...rowData];
      onDataChange(updatedData);
    },
    [rowData, onDataChange]
  );

  // Add new row handler
  const addNewRow = useCallback(() => {
    const newRow = {
      WorkerID: `W${rowData.length + 1}`,
      WorkerName: "",
      Skills: [],
      AvailableSlots: [],
      MaxLoadPerPhase: 1,
      WorkerGroup: "",
      QualificationLevel: "",
    };

    setRowData([...rowData, newRow]);
    onDataChange([...rowData, newRow]);
  }, [rowData, onDataChange]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Workers</h2>
        <button
          onClick={addNewRow}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Add Worker
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

export default WorkerGrid;
