const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const workbook = XLSX.readFile("pay.xlsx");

const sheetNames = workbook.SheetNames;

const schedule = [
  { name: "가입시", chasu: 1 },
  { name: "가입후1개월", chasu: 2 },
  { name: "가입후2개월", chasu: 3 },
  { name: "협동조합설립시", chasu: 4 },
  { name: "건축심의접수시", chasu: 5 },
  { name: "건축심의완료시", chasu: 6 },
  { name: "사업승인신청시", chasu: 7 },
  { name: "사업승인완료시", chasu: 8 },
  { name: "착공시", chasu: 9 },
];

sheetNames.forEach((sheetName) => {
  const worksheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const startRow = 6;
  const filteredJson = json.slice(startRow);

  const result = filteredJson
    .filter((row) => row[4] !== "소계")
    .map((row) => {
      return {
        typeid: row[0],
        floor: row[1],
        type: row[2],
        area: row[3],
        group: row[4],
        count: row[5],
        areaprice: row[6] * 1000,
        areasum: Math.round(row[7] * 1000),
        pricearray: [
          row[9] + "000",
          row[10] + "000",
          row[11] + "000",
          row[12] + "000",
          row[13] + "000",
          row[14] + "000",
          row[15] + "000",
          row[16] + "000",
          row[17] + "000",
        ],
        sumprice: row[18] + "000",
        payratio: Math.round(row[19] * 100),
      };
    });

  const finalJson = {
    id: 1,
    submitturn: sheetName,
    createdate: "2024-07-11",
    creator: " ",
    comment: "스케줄업로드",
    detail: result,
    schedule: schedule,
  };
  const jsonFileName = `${sheetName}.json`;
  const jsonFilePath = path.join(__dirname, jsonFileName);
  fs.writeFileSync(jsonFilePath, JSON.stringify(finalJson, null, 2));

  console.log(`Saved ${jsonFileName}`);
});
