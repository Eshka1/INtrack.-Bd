const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class ExportService {


    async generateExcel(data = []) {

        const workbook = new ExcelJS.Workbook();

        const sheet =
            workbook.addWorksheet("Export");

        if(data.length > 0){

            sheet.columns =
                Object.keys(data[0]).map(key => ({
                    header:key,
                    key:key
                }));

            data.forEach(item=>{
                sheet.addRow(item);
            });

        }


        const file =
        path.join(
            __dirname,
            "../exports/export.xlsx"
        );


        await workbook.xlsx.writeFile(file);

        return file;

    }



    async generatePDF(data = []) {


        const file =
        path.join(
            __dirname,
            "../exports/export.pdf"
        );


        const doc =
        new PDFDocument();


        doc.pipe(
            fs.createWriteStream(file)
        );


        doc.fontSize(18)
        .text("IN-Track Export Report");


        doc.fontSize(12)
        .text(
            JSON.stringify(data,null,2)
        );


        doc.end();


        return file;

    }

}

module.exports = new ExportService();