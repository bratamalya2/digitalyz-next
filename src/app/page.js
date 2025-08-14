"use client";

import { useState, useEffect } from "react";
import FileUploader from "../components/FileUploader";
import ClientGrid from "../components/grid/ClientGrid";
import WorkerGrid from "../components/grid/WorkerGrid";
import TaskGrid from "../components/grid/TaskGrid";
import { validateDataRelationships } from "../lib/validators";
import FilterInput from "@/components/filterInput/filterInput";
import RuleUI from "@/components/RuleUI/ruleUI";

export default function Home() {
  // State for data
  const [clientData, setClientData] = useState([]);
  const [workerData, setWorkerData] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [existingRules, setExistingRules] = useState({});

  // State for validation results
  const [validationResults, setValidationResults] = useState(null);

  // State for active tab
  const [activeTab, setActiveTab] = useState("clients");

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Handle data loaded from Excel file
  const handleDataLoaded = (data) => {
    setClientData(data.clientData || []);
    localStorage.setItem("clientData", JSON.stringify(data.clientData || []));
    setWorkerData(data.workerData || []);
    localStorage.setItem("workerData", JSON.stringify(data.workerData || []));
    setTaskData(data.taskData || []);
    localStorage.setItem("taskData", JSON.stringify(data.taskData || []));

    // Validate data relationships
    const validationResult = validateDataRelationships(data);
    setValidationResults(validationResult);
  };

  const resetData = () => {
    setClientData(JSON.parse(localStorage.getItem("clientData")) || []);
    setWorkerData(JSON.parse(localStorage.getItem("workerData")) || []);
    setTaskData(JSON.parse(localStorage.getItem("taskData")) || []);
  };

  // Validate data when it changes
  useEffect(() => {
    if (clientData.length > 0 || workerData.length > 0 || taskData.length > 0) {
      const validationResult = validateDataRelationships({
        clientData,
        workerData,
        taskData,
      });
      setValidationResults(validationResult);
    }
  }, [clientData, workerData, taskData]);

  // useEffect(() => {
  //   console.log("Client data: ", clientData);
  // }, [clientData]);

  // useEffect(() => {
  //   console.log("Worker data: ", workerData);
  // }, [workerData]);

  // useEffect(() => {
  //   console.log("Task data: ", taskData);
  // }, [taskData]);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Excel Data Viewer
        </h1>
        <p className="text-center text-gray-600">
          Upload and edit data from Excel sheets
        </p>
      </header>

      <div className="mb-8">
        <FileUploader onDataLoaded={handleDataLoaded} />
      </div>
      <div className="w-full flex flex-row items-center justify-between">
        {validationResults && (
          <div className="mb-8 w-[44%]">
            <h2 className="text-xl font-semibold mb-2">Validation Results</h2>
            <div
              className={`p-4 rounded-md ${
                validationResults.valid ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <p
                className={`font-medium ${
                  validationResults.valid ? "text-green-700" : "text-red-700"
                }`}
              >
                {validationResults.valid
                  ? "Data is valid!"
                  : "Data has validation errors"}
              </p>

              {validationResults.errors.length > 0 && (
                <div className="mt-2">
                  <h3 className="font-medium text-red-700">Errors:</h3>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {validationResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResults.warnings.length > 0 && (
                <div className="mt-2">
                  <h3 className="font-medium text-yellow-700">Warnings:</h3>
                  <ul className="list-disc list-inside text-sm text-yellow-700">
                    {validationResults.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        {clientData.length > 0 &&
          workerData.length > 0 &&
          taskData.length > 0 && (
            <FilterInput
              setClientData={setClientData}
              setWorkerData={setWorkerData}
              setTaskData={setTaskData}
              resetData={resetData}
            />
          )}
      </div>

      {clientData.length > 0 &&
        workerData.length > 0 &&
        taskData.length > 0 && (
          <RuleUI
            show={show}
            handleShow={handleShow}
            handleClose={handleClose}
            clientData={clientData}
            workerData={workerData}
            taskData={taskData}
            existingRules={existingRules}
            setExistingRules={setExistingRules}
          />
        )}

      {/* Tabs */}
      {(clientData.length > 0 ||
        workerData.length > 0 ||
        taskData.length > 0) && (
        <>
          <div className="mb-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("clients")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "clients"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Clients
              </button>
              <button
                onClick={() => setActiveTab("workers")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "workers"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Workers
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "tasks"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Tasks
              </button>
            </nav>
          </div>

          {/* Grid Components */}
          <div className="h-[600px]">
            {activeTab === "clients" && (
              <ClientGrid data={clientData} onDataChange={setClientData} />
            )}

            {activeTab === "workers" && (
              <WorkerGrid data={workerData} onDataChange={setWorkerData} />
            )}

            {activeTab === "tasks" && (
              <TaskGrid data={taskData} onDataChange={setTaskData} />
            )}
          </div>
        </>
      )}

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Excel Data Viewer - Built with Next.js and AG-Grid</p>
      </footer>
    </div>
  );
}
