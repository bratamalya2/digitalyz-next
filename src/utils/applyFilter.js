// utils/applyFilter.js
export function applyFilter(data, filterCode) {
  try {
    // Safely create the filter function
    // eslint-disable-next-line no-new-func
    console.log(filterCode);
    return data.filter(filterCode);
  } catch (err) {
    throw new Error("Invalid filter code");
    //return data;
  }

  // Apply the filter to the data
}
