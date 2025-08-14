export default function downloadJSON(jsonData) {
  const jsonString = JSON.stringify(jsonData, null, 2);

  // Create a blob with type application/json
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a temporary URL
  const url = URL.createObjectURL(blob);

  // Create an anchor element and trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.json"; // file name
  a.click();

  // Cleanup
  URL.revokeObjectURL(url);
}
