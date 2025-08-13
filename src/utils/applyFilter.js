// utils/applyFilter.js
export function applyFilter(data, filterCode) {
  let filterFn;
  try {
    // Safely create the filter function
    // eslint-disable-next-line no-new-func
    filterFn = new Function(`return ${filterCode}`)();
  } catch (err) {
    throw new Error("Invalid filter code");
  }

  // Apply the filter to the data
  return data.filter(filterFn);
}
