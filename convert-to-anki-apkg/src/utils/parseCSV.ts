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
