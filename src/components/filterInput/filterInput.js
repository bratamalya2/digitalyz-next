import { useState } from "react";

import { applyFilter } from "@/utils/applyFilter";

const clientHeaders = [
  "ClientID",
  "ClientName",
  "PriorityLevel",
  "RequestedTaskIDs",
  "GroupTag",
  "AttributesJSON",
];
const workerHeaders = [
  "WorkerID",
  "WorkerName",
  "Skills",
  "AvailableSlots",
  "MaxLoadPerPhase",
  "WorkerGroup",
  "QualificationLevel",
];
const taskHeaders = [
  "TaskID",
  "TaskName",
  "Category",
  "Duration",
  "RequiredSkills",
  "PreferredPhases",
  "MaxConcurrentTasks",
];

const clientHeadersDataType = [
  "string",
  "string",
  "number",
  "array of strings",
  "string",
  "JSON object",
];

const workerHeadersDataType = [
  "string",
  "string",
  "array of strings",
  "array of numbers",
  "number",
  "string",
  "number",
];

const taskHeadersDataType = [
  "string",
  "string",
  "string",
  "number",
  "array of strings",
  "array of numbers",
  "number",
];

export default function FilterInput({
  setClientData,
  setWorkerData,
  setTaskData,
  resetData,
}) {
  const [filterPrompt, setFilterPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState("Client");

  async function handleFilter() {
    try {
      let columns;
      switch (selectedFile) {
        case "Client":
          columns = clientHeaders;
          break;
        case "Worker":
          columns = workerHeaders;
          break;
        case "Task":
          columns = taskHeaders;
          break;
        default:
          columns = [];
      }
      let res, dataTypes;

      switch (selectedFile) {
        case "Client":
          dataTypes = clientHeadersDataType;
          break;
        case "Worker":
          dataTypes = workerHeadersDataType;
          break;
        case "Task":
          dataTypes = taskHeadersDataType;
          break;
        default:
          dataTypes = [];
      }
      res = await fetch("/api/generate-filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns, filterPrompt, dataTypes }),
      });
      const data = await res.json();
      if (data.success) {
        const filterFunction = new Function(
          "row",
          `return ${data.filterCode};`
        );
        switch (selectedFile) {
          case "Client":
            setClientData((prevData) => {
              const result = applyFilter(prevData, filterFunction);
              return result;
            });
            break;
          case "Worker":
            setWorkerData((prevData) => {
              console.log("Previous Worker Data: ", prevData);
              const result = applyFilter(prevData, filterFunction);
              console.log("Filtered Worker Data: ", result);
              return result;
            });
            break;
          case "Task":
            setTaskData((prevData) => {
              const result = applyFilter(prevData, filterFunction);
              return result;
            });
            break;
        }
      } else {
        alert("Invalid filter!");
        console.error("Error generating filter:", data.error);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="mb-8 w-[44%] text-black-500 px-5 py-7 bg-green-100 rounded-md flex flex-col gap-y-4">
      <h2 className="text-xl font-semibold mb-2">Filter Data</h2>
      <input
        type="text"
        placeholder="Filter..."
        value={filterPrompt}
        name="filterPrompt"
        onChange={(e) => setFilterPrompt(e.target.value)}
        className="w-full p-2 border border-black rounded-md"
      />
      <div>
        <select
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          className="p-2 border border-black rounded-md"
        >
          <option value="Client">Client</option>
          <option value="Worker">Worker</option>
          <option value="Task">Task</option>
        </select>
      </div>
      <button
        onClick={handleFilter}
        className="bg-blue-500 text-white p-2 rounded-lg"
      >
        Apply Filter
      </button>
      <button
        onClick={resetData}
        className="bg-blue-500 text-white p-2 rounded-lg"
      >
        Reset Data
      </button>
    </div>
  );
}
