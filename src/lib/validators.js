/**
 * Validates client data against schema requirements
 * @param {Array} clientData - Array of client objects
 * @returns {Object} - Validation results with errors and warnings arrays
 */
export const validateClientData = (clientData) => {
  const errors = [];
  const warnings = [];
  const clientIds = new Set();
  
  if (!clientData || !Array.isArray(clientData)) {
    return { valid: false, errors: ['Client data is missing or invalid'], warnings: [] };
  }
  
  clientData.forEach((client, index) => {
    // Check required fields
    if (!client.ClientID) {
      errors.push(`Row ${index + 1}: ClientID is required`);
    } else if (clientIds.has(client.ClientID)) {
      errors.push(`Row ${index + 1}: Duplicate ClientID ${client.ClientID}`);
    } else {
      clientIds.add(client.ClientID);
    }
    
    if (!client.ClientName) {
      errors.push(`Row ${index + 1}: ClientName is required`);
    }
    
    // Validate PriorityLevel (1-5)
    if (client.PriorityLevel !== undefined) {
      const priority = Number(client.PriorityLevel);
      if (isNaN(priority) || priority < 1 || priority > 5) {
        errors.push(`Row ${index + 1}: PriorityLevel must be between 1 and 5`);
      } else if (priority > 3) {
        warnings.push(`Row ${index + 1}: High priority client (level ${priority}) may require special attention`);
      }
    }
    
    // Validate RequestedTaskIDs is an array
    if (client.RequestedTaskIDs !== undefined) {
      if (!Array.isArray(client.RequestedTaskIDs)) {
        errors.push(`Row ${index + 1}: RequestedTaskIDs must be an array`);
      } else if (client.RequestedTaskIDs.length > 5) {
        warnings.push(`Row ${index + 1}: Client has a large number of requested tasks (${client.RequestedTaskIDs.length})`);
      }
    }
    
    // Validate AttributesJSON is an object
    if (client.AttributesJSON !== undefined) {
      if (typeof client.AttributesJSON !== 'object' || client.AttributesJSON === null) {
        errors.push(`Row ${index + 1}: AttributesJSON must be a valid JSON object`);
      }
    }
  });
  
  return { valid: errors.length === 0, errors, warnings };
};

/**
 * Validates worker data against schema requirements
 * @param {Array} workerData - Array of worker objects
 * @returns {Object} - Validation results with errors and warnings arrays
 */
export const validateWorkerData = (workerData) => {
  const errors = [];
  const warnings = [];
  const workerIds = new Set();
  
  if (!workerData || !Array.isArray(workerData)) {
    return { valid: false, errors: ['Worker data is missing or invalid'], warnings: [] };
  }
  
  workerData.forEach((worker, index) => {
    // Check required fields
    if (!worker.WorkerID) {
      errors.push(`Row ${index + 1}: WorkerID is required`);
    } else if (workerIds.has(worker.WorkerID)) {
      errors.push(`Row ${index + 1}: Duplicate WorkerID ${worker.WorkerID}`);
    } else {
      workerIds.add(worker.WorkerID);
    }
    
    if (!worker.WorkerName) {
      errors.push(`Row ${index + 1}: WorkerName is required`);
    }
    
    // Validate Skills is an array
    if (worker.Skills !== undefined) {
      if (!Array.isArray(worker.Skills)) {
        errors.push(`Row ${index + 1}: Skills must be an array`);
      } else if (worker.Skills.length === 0) {
        warnings.push(`Row ${index + 1}: Worker has no skills defined`);
      }
    }
    
    // Validate AvailableSlots is an array
    if (worker.AvailableSlots !== undefined) {
      if (!Array.isArray(worker.AvailableSlots)) {
        errors.push(`Row ${index + 1}: AvailableSlots must be an array`);
      } else if (worker.AvailableSlots.length < 3) {
        warnings.push(`Row ${index + 1}: Worker has limited availability (${worker.AvailableSlots.length} slots)`);
      }
    }
    
    // Validate MaxLoadPerPhase (numeric)
    if (worker.MaxLoadPerPhase !== undefined) {
      const maxLoad = Number(worker.MaxLoadPerPhase);
      if (isNaN(maxLoad) || maxLoad < 0) {
        errors.push(`Row ${index + 1}: MaxLoadPerPhase must be a positive number`);
      } else if (maxLoad > 5) {
        warnings.push(`Row ${index + 1}: Worker has high MaxLoadPerPhase (${maxLoad})`);
      }
    }
    
    // Validate QualificationLevel (1-5)
    if (worker.QualificationLevel !== undefined) {
      const level = Number(worker.QualificationLevel);
      if (isNaN(level) || level < 1 || level > 5) {
        errors.push(`Row ${index + 1}: QualificationLevel must be between 1 and 5`);
      } else if (level < 3) {
        warnings.push(`Row ${index + 1}: Worker has low qualification level (${level})`);
      }
    }
  });
  
  return { valid: errors.length === 0, errors, warnings };
};

/**
 * Validates task data against schema requirements
 * @param {Array} taskData - Array of task objects
 * @returns {Object} - Validation results with errors and warnings arrays
 */
export const validateTaskData = (taskData) => {
  const errors = [];
  const warnings = [];
  const taskIds = new Set();
  
  if (!taskData || !Array.isArray(taskData)) {
    return { valid: false, errors: ['Task data is missing or invalid'], warnings: [] };
  }
  
  taskData.forEach((task, index) => {
    // Check required fields
    if (!task.TaskID) {
      errors.push(`Row ${index + 1}: TaskID is required`);
    } else if (taskIds.has(task.TaskID)) {
      errors.push(`Row ${index + 1}: Duplicate TaskID ${task.TaskID}`);
    } else {
      taskIds.add(task.TaskID);
    }
    
    if (!task.TaskName) {
      errors.push(`Row ${index + 1}: TaskName is required`);
    }
    
    // Validate Duration (numeric)
    if (task.Duration !== undefined) {
      const duration = Number(task.Duration);
      if (isNaN(duration) || duration <= 0) {
        errors.push(`Row ${index + 1}: Duration must be a positive number`);
      } else if (duration > 8) {
        warnings.push(`Row ${index + 1}: Task has long duration (${duration} hours)`);
      }
    }
    
    // Validate RequiredSkills is an array
    if (task.RequiredSkills !== undefined) {
      if (!Array.isArray(task.RequiredSkills)) {
        errors.push(`Row ${index + 1}: RequiredSkills must be an array`);
      } else if (task.RequiredSkills.length > 3) {
        warnings.push(`Row ${index + 1}: Task requires many skills (${task.RequiredSkills.length})`);
      }
    }
    
    // Validate PreferredPhases is an array
    if (task.PreferredPhases !== undefined) {
      if (!Array.isArray(task.PreferredPhases)) {
        errors.push(`Row ${index + 1}: PreferredPhases must be an array`);
      } else if (task.PreferredPhases.length === 0) {
        warnings.push(`Row ${index + 1}: Task has no preferred phases defined`);
      }
    }
    
    // Validate MaxConcurrent (numeric)
    if (task.MaxConcurrent !== undefined) {
      const maxConcurrent = Number(task.MaxConcurrent);
      if (isNaN(maxConcurrent) || maxConcurrent < 1) {
        errors.push(`Row ${index + 1}: MaxConcurrent must be a positive integer`);
      } else if (maxConcurrent > 3) {
        warnings.push(`Row ${index + 1}: Task has high concurrency (${maxConcurrent})`);
      }
    }
  });
  
  return { valid: errors.length === 0, errors, warnings };
};

/**
 * Validates relationships between client, worker, and task data
 * @param {Object} data - Object containing clientData, workerData, and taskData arrays
 * @returns {Object} - Validation results with errors and warnings arrays
 */
export const validateDataRelationships = (data) => {
  const { clientData, workerData, taskData } = data;
  const errors = [];
  const warnings = [];
  
  // Validate individual data sets first
  const clientValidation = validateClientData(clientData);
  const workerValidation = validateWorkerData(workerData);
  const taskValidation = validateTaskData(taskData);
  
  // Combine individual validation errors
  errors.push(...clientValidation.errors);
  errors.push(...workerValidation.errors);
  errors.push(...taskValidation.errors);
  
  // Skip relationship validation if individual validations failed
  if (!clientValidation.valid || !workerValidation.valid || !taskValidation.valid) {
    return { valid: false, errors, warnings };
  }
  
  // Create sets of valid IDs for reference
  const validTaskIds = new Set(taskData.map(task => task.TaskID));
  const validWorkerIds = new Set(workerData.map(worker => worker.WorkerID));
  
  // Check client-task relationships
  clientData.forEach((client, index) => {
    if (client.RequestedTaskIDs && Array.isArray(client.RequestedTaskIDs)) {
      client.RequestedTaskIDs.forEach(taskId => {
        if (!validTaskIds.has(taskId)) {
          errors.push(`Client ${client.ClientID}: Referenced TaskID ${taskId} does not exist`);
        }
      });
    }
  });
  
  // Check worker skills against task requirements
  const workerSkills = {};
  workerData.forEach(worker => {
    workerSkills[worker.WorkerID] = new Set(worker.Skills || []);
  });
  
  taskData.forEach(task => {
    if (task.RequiredSkills && Array.isArray(task.RequiredSkills) && task.RequiredSkills.length > 0) {
      // Find workers who have all required skills for this task
      const qualifiedWorkers = workerData.filter(worker => {
        if (!worker.Skills || !Array.isArray(worker.Skills)) return false;
        
        return task.RequiredSkills.every(skill => worker.Skills.includes(skill));
      });
      
      if (qualifiedWorkers.length === 0) {
        errors.push(`Task ${task.TaskID}: No workers have all required skills: ${task.RequiredSkills.join(', ')}`);
      } else if (qualifiedWorkers.length < 2) {
        warnings.push(`Task ${task.TaskID}: Only ${qualifiedWorkers.length} worker has all required skills`);
      }
    }
  });
  
  // Check for worker group and client group tag compatibility
  clientData.forEach(client => {
    if (client.GroupTag && client.RequestedTaskIDs && Array.isArray(client.RequestedTaskIDs)) {
      const matchingWorkers = workerData.filter(worker => worker.WorkerGroup === client.GroupTag);
      
      if (matchingWorkers.length === 0 && client.RequestedTaskIDs.length > 0) {
        errors.push(`Client ${client.ClientID}: No workers match GroupTag ${client.GroupTag}`);
      } else if (matchingWorkers.length < 2 && client.RequestedTaskIDs.length > 3) {
        warnings.push(`Client ${client.ClientID}: Only ${matchingWorkers.length} worker matches GroupTag ${client.GroupTag} for ${client.RequestedTaskIDs.length} tasks`);
      }
    }
  });
  
  return { valid: errors.length === 0, errors, warnings };
};