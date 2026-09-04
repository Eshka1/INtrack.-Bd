const PDFDocument = require("pdfkit");
const fs = require("fs");


function generatePDF(data,filePath){

    return new Promise((resolve)=>{


        const doc = new PDFDocument();

        doc.pipe(
            fs.createWriteStream(filePath)
        );


        doc.fontSize(18)
        .text("IN-Track Export Report");


        doc.moveDown();


        doc.fontSize(12)
        .text(
            JSON.stringify(data,null,2)
        );


        doc.end();


        doc.on("end",()=>{
            resolve(filePath);
        });


    });

}


module.exports = generatePDF;