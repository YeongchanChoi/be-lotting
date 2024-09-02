const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = XLSX.readFile('test.xlsx');

const sheetNames = workbook.SheetNames;

const schedule = [
    {"0":"가입시","chasu":"1차"},
    {"1":"가입후1개월","chasu":"2차"},
    {"2":"가입후6개월","chasu":"3차"},
    {"3":"가입후10개월","chasu":"4차"},
    {"4":"협동조합설립시","chasu":"5차"},
    {"5":"건축심의완료시","chasu":"6차"},
    {"6":"사업승인완료시","chasu":"7차"},
    {"7":"착공시","chasu":"8차"}
];

sheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const startRow = 5;
    const filteredJson = json.slice(startRow);

    const result = filteredJson.map(row => {
        return {
            typeid: row[0],
            floor: row[1],
            type: row[2],
            area: row[3],
            group: row[4],
            count: row[5],
            areaprice: row[6]+'000',
            areasum: row[7]+'000',
            pricearray: {
                "0": row[8]+'000',
                "1": row[9]+'000',
                "2": row[10]+'000',
                "3": row[11]+'000',
                "4": row[12]+'000',
                "5": row[13]+'000',
                "6": row[14]+'000',
                "7": row[15]+'000'
            },
            sumprice: row[16]+'000',
            payratio: row[17]*100
        };
    });

    const finalJson = {
        id: null,
        submitturn: sheetName,
        createdat: null,
        creator: null,
        comment: null,
        schedule: schedule,
        detail: result
    };

    const jsonFileName = `${sheetName}.json`;
    const jsonFilePath = path.join(__dirname, jsonFileName);
    fs.writeFileSync(jsonFilePath, JSON.stringify(finalJson, null, 2));

    console.log(`Saved ${jsonFileName}`);
});
