const exportService =
    require("../services/exportService");


class ExportController {


    // =========================================
    // Export Excel
    // =========================================
    async exportExcel(req, res) {

        try {

            const buffer =
                await exportService
                    .generateExcel(
                        req.tenantId
                    );


            const filename =
                `INTrack_${req.tenantId}_export.xlsx`;


            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );


            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${filename}"`
            );


            res.setHeader(
                "Content-Length",
                buffer.length
            );


            return res
                .status(200)
                .send(buffer);

        }
        catch(error) {

            console.error(
                "EXCEL EXPORT ERROR:"
            );

            console.error(
                error.stack
            );


            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        error.message
                });

        }

    }


    // =========================================
    // Export PDF
    // =========================================
    async exportPDF(req, res) {

        try {

            const buffer =
                await exportService
                    .generatePDF(
                        req.tenantId
                    );


            const filename =
                `INTrack_${req.tenantId}_export.pdf`;


            res.setHeader(
                "Content-Type",
                "application/pdf"
            );


            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${filename}"`
            );


            res.setHeader(
                "Content-Length",
                buffer.length
            );


            return res
                .status(200)
                .send(buffer);

        }
        catch(error) {

            console.error(
                "PDF EXPORT ERROR:"
            );

            console.error(
                error.stack
            );


            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        error.message
                });

        }

    }

}


module.exports =
    new ExportController();