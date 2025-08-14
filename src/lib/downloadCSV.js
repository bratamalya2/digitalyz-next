export default function downloadCSV(jsonData, fileName) {
    const headers = Object.keys(jsonData[0]);

    // Create CSV rows
    const csvRows = [];
    csvRows.push(headers.join(",")); // header row

    jsonData.forEach(row => {
      const values = headers.map(header => {
        const escaped = ("" + row[header]).replace(/"/g, '""');
        return `"${escaped}"`; // wrap values in quotes
      });
      csvRows.push(values.join(","));
    });

    // Convert to CSV string
    const csvString = csvRows.join("\n");

    // Create a blob
    const blob = new Blob([csvString], { type: "text/csv" });

    // Create a temporary link to download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}