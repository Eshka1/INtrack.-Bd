const ExcelJS = require("exceljs");

async function generateExcel(data, filePath){

    const workbook =
        new ExcelJS.Workbook();

    const worksheet =
        workbook.addWorksheet("IN-Track Export");


    if(data.length > 0){

        worksheet.columns =
        Object.keys(data[0]).map(key=>({
            header:key,
            key:key
        }));


        data.forEach(item=>{
            worksheet.addRow(item);
        });

    }


    await workbook.xlsx.writeFile(filePath);

    return filePath;

}


module.exports = generateExcel;