import { expect, it, describe } from "vitest";
import { getRows } from "./parseCSV.ts";

const csvData = "one,two,three\n1,2,3";
describe("getRows", () => {
  it("Returns all rows including titles (first row)", () => {
    expect(getRows(csvData, undefined, true)).toEqual(['one,two,three', '1,2,3']);
  });
  it.fails("Returns error if no CSV data is passed as an argument", () => {
    expect(getRows('')).toThrowError('No CSV Data passed');
  });
  it("Returns all rows except titles (first row)", () => {
    expect(getRows(csvData,undefined,false)).toEqual(["1,2,3"]);
  });
  it("Returns all rows based on delimiter", () => {
    expect(getRows(csvData,',')).toEqual(['two','three\n1','2','3']);
  });
});
