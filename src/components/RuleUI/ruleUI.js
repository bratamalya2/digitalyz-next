import { useState, useEffect, use } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

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

export default function RuleUI({
  show,
  handleShow,
  handleClose,
  existingRules,
  setExistingRules,
  clientData,
  workerData,
  taskData
}) {
  const [ruleName, setRuleName] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [ruleCode, setRuleCode] = useState("");

  async function generateAndApplyRule() {
    try {
      const res = await fetch("/api/generate-rule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleName: "Active Clients Rule",
          ruleDescription: "Keep only clients whose Status is Active",
          clientData,
          workerData,
          taskData,
          clientHeaders,
          workerHeaders,
          taskHeaders,
          clientHeadersDataType,
          workerHeadersDataType,
          taskHeadersDataType,
        }),
      });

      const data = await res.json();

      if (data.success)
        return new Function("clientData", "workerData", "taskData", data.ruleCode);
      else return null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  const submitRule = async () => {
    try {
      if (ruleName.length === 0) {
        alert("Rule Name required!");
        return;
      }
      if (ruleCode.length === 0 && ruleDescription.length === 0) {
        alert("Either Rule Code or Description required!");
        return;
      }
      if (existingRules[ruleName]) {
        alert("Rule with this name already exists!");
        return;
      }
      if (ruleCode.length > 0) {
        setExistingRules({
          ...existingRules,
          [ruleName]: { code: ruleCode, description: ruleDescription },
        });
        return;
      }
      const newRuleCode = await generateAndApplyRule();
      console.log("New rule code: ", newRuleCode);
      setExistingRules({
        ...existingRules,
        [ruleName]: { code: newRuleCode, description: ruleDescription },
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    console.log("Existing Rules: ", existingRules);
  }, [existingRules]);

  return (
    <>
      <div className="w-[80%] mx-auto h-[200px] flex flex-col bg-green-100 items-center justify-center gap-y-4">
        {Object.keys(existingRules).length === 0 && <p>No rules defined</p>}
        {Object.keys(existingRules).length > 0 && (
          <button className="bg-blue-500 text-white p-2 rounded-md">
            Download Rules Document
          </button>
        )}
        <button
          className="bg-blue-500 text-white p-2 rounded-md"
          onClick={handleShow}
        >
          Add New Rule
        </button>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Rule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="w-full flex flex-row items-center gap-x-14">
            <label>Rule Name:</label>
            <input
              type="text"
              placeholder="Rule Name"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="border border-black rounded-md px-3 grow"
            />
          </div>
          <div className="w-full mt-3 flex flex-row items-center gap-x-4">
            <label>Rule Description:</label>
            <textarea
              placeholder="Rule Description (Optional)"
              value={ruleDescription}
              onChange={(e) => setRuleDescription(e.target.value)}
              className="border border-black rounded-md px-3 grow min-h-[100px]"
            />
          </div>
          <div className="w-full mt-3 flex flex-row items-center gap-x-14">
            <label>Rule Code:</label>
            <input
              type="text"
              placeholder="Rule Code"
              value={ruleCode}
              onChange={(e) => setRuleCode(e.target.value)}
              className="border border-black rounded-md px-3 grow"
            />
          </div>
          <p className="mt-3 text-red-400">
            * Provide both rule code and description or only description.
            Provide only rule description if you want to generate rule via AI.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              handleClose();
              setRuleName("");
              setRuleDescription("");
              setRuleCode("");
            }}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleClose();
              submitRule();
              setRuleName("");
              setRuleDescription("");
              setRuleCode("");
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
