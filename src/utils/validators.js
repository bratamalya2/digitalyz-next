/**
 * Validates client data against requirements
 * @param {Array} clientData - Array of client objects
 * @param {Array} taskData - Array of task objects for cross-validation
 * @returns {Object} Validation results with errors and warnings
 */
export const validateClientData = (clientData, taskData) => {
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  if (!clientData || clientData.length === 0) {
    result.valid = false;
    result.errors.push('No client data found');
    return result;
  }

  // Create a set of all task IDs for quick lookup
  const taskIds = new Set(taskData.map(task => task.TaskID));

  // Validate each client
  clientData.forEach((client, index) => {
    // Check required fields
    if (!client.ClientID) {
      result.valid = false;
      result.errors.push(`Client at index ${index} is missing ClientID`);
    }

    // Validate PriorityLevel (1-5)
    if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
      result.valid = false;
      result.errors.push(`Client ${client.ClientID}: PriorityLevel must be between 1 and 5`);
    }

    // Validate RequestedTaskIDs against existing tasks
    if (client.RequestedTaskIDs && client.RequestedTaskIDs.length > 0) {
      client.RequestedTaskIDs.forEach(taskId => {
        if (!taskIds.has(taskId)) {
          result.valid = false;
          result.errors.push(`Client ${client.ClientID}: Requested task ${taskId} does not exist`);
        }
      });
    }

    // Validate AttributesJSON
    if (client.AttributesJSON && typeof client.AttributesJSON !== 'object') {
      result.valid = false;
      result.errors.push(`Client ${client.ClientID}: AttributesJSON must be a valid JSON object`);
    }
  });

  return result;
};

/**
 * Validates worker data against requirements
 * @param {Array} workerData - Array of worker objects
 * @param {Array} taskData - Array of task objects for cross-validation
 * @returns {Object} Validation results with errors and warnings
 */
export const validateWorkerData = (workerData, taskData) => {
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  if (!workerData || workerData.length === 0) {
    result.valid = false;
    result.errors.push('No worker data found');
    return result;
  }

  // Collect all required skills from tasks
  const allRequiredSkills = new Set();
  taskData.forEach(task => {
    if (task.RequiredSkills && task.RequiredSkills.length > 0) {
      task.RequiredSkills.forEach(skill => allRequiredSkills.add(skill));
    }
  });

  // Validate each worker
  workerData.forEach((worker, index) => {
    // Check required fields
    if (!worker.WorkerID) {
      result.valid = false;
      result.errors.push(`Worker at index ${index} is missing WorkerID`);
    }

    // Validate AvailableSlots
    if (!worker.AvailableSlots || !Array.isArray(worker.AvailableSlots)) {
      result.warnings.push(`Worker ${worker.WorkerID}: AvailableSlots should be an array of phase numbers`);
    } else if (worker.AvailableSlots.some(slot => typeof slot !== 'number' || slot < 1)) {
      result.warnings.push(`Worker ${worker.WorkerID}: AvailableSlots contains invalid phase numbers`);
    }

    // Validate MaxLoadPerPhase
    if (typeof worker.MaxLoadPerPhase !== 'number' || worker.MaxLoadPerPhase < 1) {
      result.warnings.push(`Worker ${worker.WorkerID}: MaxLoadPerPhase should be a positive number`);
    }
  });

  // Check if all required skills are covered by at least one worker
  const allWorkerSkills = new Set();
  workerData.forEach(worker => {
    if (worker.Skills && worker.Skills.length > 0) {
      worker.Skills.forEach(skill => allWorkerSkills.add(skill));
    }
  });

  allRequiredSkills.forEach(skill => {
    if (!allWorkerSkills.has(skill)) {
      result.warnings.push(`No worker has the required skill: ${skill}`);
    }
  });

  return result;
};

/**
 * Validates task data against requirements
 * @param {Array} taskData - Array of task objects
 * @returns {Object} Validation results with errors and warnings
 */
export const validateTaskData = (taskData) => {
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  if (!taskData || taskData.length === 0) {
    result.valid = false;
    result.errors.push('No task data found');
    return result;
  }

  // Validate each task
  taskData.forEach((task, index) => {
    // Check required fields
    if (!task.TaskID) {
      result.valid = false;
      result.errors.push(`Task at index ${index} is missing TaskID`);
    }

    // Validate Duration
    if (typeof task.Duration !== 'number' || task.Duration < 1) {
      result.valid = false;
      result.errors.push(`Task ${task.TaskID}: Duration must be a positive number`);
    }

    // Validate PreferredPhases
    if (task.PreferredPhases && !Array.isArray(task.PreferredPhases)) {
      result.warnings.push(`Task ${task.TaskID}: PreferredPhases should be an array of phase numbers`);
    } else if (task.PreferredPhases && task.PreferredPhases.some(phase => typeof phase !== 'number' || phase < 1)) {
      result.warnings.push(`Task ${task.TaskID}: PreferredPhases contains invalid phase numbers`);
    }

    // Validate MaxConcurrent
    if (typeof task.MaxConcurrent !== 'number' || task.MaxConcurrent < 1) {
      result.warnings.push(`Task ${task.TaskID}: MaxConcurrent should be a positive number`);
    }
  });

  return result;
};

/**
 * Validates relationships between all data entities
 * @param {Object} data - Object containing clientData, workerData, and taskData arrays
 * @returns {Object} Validation results with errors and warnings
 */
export const validateDataRelationships = (data) => {
  const { clientData, workerData, taskData } = data;
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Validate client-task relationships
  const clientResult = validateClientData(clientData, taskData);
  result.errors = [...result.errors, ...clientResult.errors];
  result.warnings = [...result.warnings, ...clientResult.warnings];

  // Validate worker-task relationships
  const workerResult = validateWorkerData(workerData, taskData);
  result.errors = [...result.errors, ...workerResult.errors];
  result.warnings = [...result.warnings, ...workerResult.warnings];

  // Validate task data
  const taskResult = validateTaskData(taskData);
  result.errors = [...result.errors, ...taskResult.errors];
  result.warnings = [...result.warnings, ...taskResult.warnings];

  // Set overall validity
  result.valid = clientResult.valid && workerResult.valid && taskResult.valid;

  return result;
};