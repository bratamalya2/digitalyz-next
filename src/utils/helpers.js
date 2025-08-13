/**
 * Helper functions for the application
 */

/**
 * Creates a sample Excel file with test data
 * @returns {Object} Sample data object with clientData, workerData, and taskData
 */
export const createSampleData = () => {
  // Sample client data
  const clientData = [
    {
      ClientID: 'C001',
      ClientName: 'Acme Corporation',
      PriorityLevel: 3,
      RequestedTaskIDs: ['T001', 'T002'],
      GroupTag: 'Engineering',
      AttributesJSON: { industry: 'Manufacturing', size: 'Large' }
    },
    {
      ClientID: 'C002',
      ClientName: 'TechStart Inc',
      PriorityLevel: 4,
      RequestedTaskIDs: ['T003', 'T004', 'T005'],
      GroupTag: 'IT',
      AttributesJSON: { industry: 'Technology', size: 'Medium' }
    },
    {
      ClientID: 'C003',
      ClientName: 'Global Services',
      PriorityLevel: 2,
      RequestedTaskIDs: ['T001'],
      GroupTag: 'Consulting',
      AttributesJSON: { industry: 'Services', size: 'Small' }
    }
  ];

  // Sample worker data
  const workerData = [
    {
      WorkerID: 'W001',
      WorkerName: 'John Smith',
      Skills: ['JavaScript', 'React', 'Node.js'],
      AvailableSlots: [1, 2, 3, 4],
      MaxLoadPerPhase: 2,
      WorkerGroup: 'Engineering',
      QualificationLevel: 4
    },
    {
      WorkerID: 'W002',
      WorkerName: 'Jane Doe',
      Skills: ['Python', 'Data Analysis', 'Machine Learning'],
      AvailableSlots: [2, 3, 5],
      MaxLoadPerPhase: 3,
      WorkerGroup: 'IT',
      QualificationLevel: 5
    },
    {
      WorkerID: 'W003',
      WorkerName: 'Bob Johnson',
      Skills: ['Project Management', 'Consulting'],
      AvailableSlots: [1, 4],
      MaxLoadPerPhase: 1,
      WorkerGroup: 'Consulting',
      QualificationLevel: 3
    }
  ];

  // Sample task data
  const taskData = [
    {
      TaskID: 'T001',
      TaskName: 'Website Development',
      Category: 'Development',
      Duration: 5,
      RequiredSkills: ['JavaScript', 'React'],
      PreferredPhases: [1, 2],
      MaxConcurrent: 2
    },
    {
      TaskID: 'T002',
      TaskName: 'Backend API',
      Category: 'Development',
      Duration: 4,
      RequiredSkills: ['Node.js'],
      PreferredPhases: [2, 3],
      MaxConcurrent: 1
    },
    {
      TaskID: 'T003',
      TaskName: 'Data Analysis',
      Category: 'Analytics',
      Duration: 3,
      RequiredSkills: ['Python', 'Data Analysis'],
      PreferredPhases: [1, 2, 3],
      MaxConcurrent: 2
    },
    {
      TaskID: 'T004',
      TaskName: 'ML Model Training',
      Category: 'Analytics',
      Duration: 6,
      RequiredSkills: ['Python', 'Machine Learning'],
      PreferredPhases: [3, 4],
      MaxConcurrent: 1
    },
    {
      TaskID: 'T005',
      TaskName: 'Project Planning',
      Category: 'Management',
      Duration: 2,
      RequiredSkills: ['Project Management'],
      PreferredPhases: [1],
      MaxConcurrent: 3
    }
  ];

  return { clientData, workerData, taskData };
};

/**
 * Formats array data for display
 * @param {Array} arr - Array to format
 * @returns {string} Formatted string
 */
export const formatArray = (arr) => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return '';
  return arr.join(', ');
};

/**
 * Formats JSON data for display
 * @param {Object} json - JSON object to format
 * @returns {string} Formatted string
 */
export const formatJSON = (json) => {
  if (!json || typeof json !== 'object') return '';
  try {
    return JSON.stringify(json, null, 2);
  } catch (e) {
    return '';
  }
};