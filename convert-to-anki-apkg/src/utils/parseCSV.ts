export function getRows(
  csvData: string,
  delimiter: string = "\n",
  titles: boolean = false
) {
  let rows = csvData.split(delimiter);
  if (!csvData || !csvData.length) {
    throw new Error("No CSV Data passed");
  }
  if (titles) {
    return rows;
  }
  rows.shift();
  return rows;
}

export function getTextFromCSVFile(file: File, options: {
  load?: Function,
  loadend?: Function,
}) {
  const { name } = file;
  const fileType = name.split(".").pop();
  if (fileType !== "csv") {
    console.log("Provide csv file")
  }
  const reader = new FileReader();
  reader.addEventListener("load", (e) => {
    if (options.load && e.target) {
      options.load(e.target.result)
    }
  });
  reader.addEventListener("loadend", (e) => {
    if (options.loadend && e.target) {
      options.loadend(e.target.result)
    }
  });
  reader.readAsText(file);
}
