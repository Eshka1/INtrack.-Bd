const exportService = require("../services/exportService");

class ExportController {

    async exportExcel(req, res) {
        try {
            const file =
                await exportService.generateExcel(req.tenantId);

            return res.download(file);

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    async exportPDF(req, res) {
        try {
            const file =
                await exportService.generatePDF(req.tenantId);

            return res.download(file);

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ExportController();