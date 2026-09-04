const exportService = require("../services/exportService");

class ExportController {

    async exportExcel(req, res) {
        try {
            const buffer = await exportService.generateExcel(req.tenantId);
            const filename = `INTrack_${req.tenantId}_export.xlsx`;

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${filename}"`
            );
            res.setHeader("Content-Length", buffer.length);

            return res.status(200).send(buffer);
        } catch (error) {
            console.error("EXCEL EXPORT ERROR:", error.stack);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async exportPDF(req, res) {
        try {
            const buffer = await exportService.generatePDF(req.tenantId);
            const filename = `INTrack_${req.tenantId}_export.pdf`;

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${filename}"`
            );
            res.setHeader("Content-Length", buffer.length);

            return res.status(200).send(buffer);
        } catch (error) {
            console.error("PDF EXPORT ERROR:", error.stack);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ExportController();
