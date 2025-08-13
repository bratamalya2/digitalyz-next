"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const TaskGrid = ({ data, onDataChange }) => {
  const gridRef = useRef();
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setRowData(data);
    }
  }, [data]);

  // Column definitions
  const [columnDefs] = useState([
    { field: "TaskID", headerName: "Task ID", editable: true },
    { field: "TaskName", headerName: "Task Name", editable: true },
    { field: "Category", headerName: "Category", editable: true },
    {
      field: "Duration",
      headerName: "Duration",
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 1,
      },
      valueFormatter: (params) => {
        return params.value ? params.value : "";
      },
    },
    {
      field: "RequiredSkills",
      headerName: "Required Skills",
      editable: true,
      valueFormatter: (params) => {
        return Array.isArray(params.value)
          ? params.value.join(", ")
          : params.value;
      },
      valueSetter: (params) => {
        if (params.newValue === "") {
          params.data.RequiredSkills = [];
          return true;
        }
        params.data.RequiredSkills = params.newValue
          .split(",")
          .map((skill) => skill.trim());
        return true;
      },
    },
    {
      field: "PreferredPhases",
      headerName: "Preferred Phases",
      editable: true,
      valueFormatter: (params) => {
        return Array.isArray(params.value)
          ? params.value.join(", ")
          : params.value;
      },
      valueSetter: (params) => {
        try {
          if (params.newValue === "") {
            params.data.PreferredPhases = [];
            return true;
          }

          // Handle array notation [2,4,5]
          if (
            params.newValue.startsWith("[") &&
            params.newValue.endsWith("]")
          ) {
            params.data.PreferredPhases = JSON.parse(params.newValue);
            return true;
          }

          // Handle range notation "1-3"
          if (params.newValue.includes("-")) {
            const [start, end] = params.newValue
              .split("-")
              .map((num) => parseInt(num.trim()));
            params.data.PreferredPhases = Array.from(
              { length: end - start + 1 },
              (_, i) => start + i
            );
            return true;
          }

          // Handle comma-separated values
          params.data.PreferredPhases = params.newValue
            .split(",")
            .map((phase) => parseInt(phase.trim()));
          return true;
        } catch (error) {
          console.error("Error parsing preferred phases:", error);
          return false;
        }
      },
    },
    {
      field: "MaxConcurrent",
      headerName: "Max Concurrent",
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 1,
      },
      valueFormatter: (params) => {
        return params.value ? params.value : "";
      },
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
      TaskID: `T${rowData.length + 1}`,
      TaskName: "",
      Category: "",
      Duration: 1,
      RequiredSkills: [],
      PreferredPhases: [],
      MaxConcurrent: 1,
    };

    setRowData([...rowData, newRow]);
    onDataChange([...rowData, newRow]);
  }, [rowData, onDataChange]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <button
          onClick={addNewRow}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Add Task
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

export default TaskGrid;
