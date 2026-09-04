const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");

class ExportService {

    normalizeValue(value) {
        if (value === null || value === undefined) return "";
        if (value instanceof Date) return value.toISOString();
        if (
            value &&
            value.constructor &&
            value.constructor.name === "ObjectId"
        ) {
            return value.toString();
        }
        if (Array.isArray(value)) return JSON.stringify(value);
        if (typeof value === "object") return JSON.stringify(value);
        return value;
    }

    flattenDocument(document) {
        const output = {};

        const flatten = (object, prefix = "") => {
            Object.entries(object || {}).forEach(([key, value]) => {
                const newKey = prefix ? `${prefix}.${key}` : key;

                if (
                    value &&
                    typeof value === "object" &&
                    !Array.isArray(value) &&
                    !(value instanceof Date) &&
                    !(value.constructor && value.constructor.name === "ObjectId")
                ) {
                    flatten(value, newKey);
                } else {
                    output[newKey] = this.normalizeValue(value);
                }
            });
        };

        flatten(document);
        return output;
    }

    async loadTenantData(tenantId) {
        if (!mongoose.Types.ObjectId.isValid(tenantId)) {
            throw new Error("Invalid tenant ID");
        }

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("MongoDB connection is not available");
        }

        const objectId = new mongoose.Types.ObjectId(tenantId);
        const collections = await db.listCollections().toArray();
        const result = {};

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;

            if (collectionName.startsWith("system.")) {
                continue;
            }

            const collection = db.collection(collectionName);
            let filter;

            if (collectionName === "tenants") {
                filter = { _id: objectId };
            } else {
                filter = {
                    $or: [
                        { tenantId: objectId },
                        { tenantId },
                        { companyId: objectId },
                        { companyId: tenantId },
                        { company_id: tenantId }
                    ]
                };
            }

            try {
                const rows = await collection.find(filter).toArray();
                if (rows.length > 0) {
                    result[collectionName] = rows;
                }
            } catch (error) {
                console.error(
                    `Unable to export collection ${collectionName}:`,
                    error.message
                );
            }
        }

        return result;
    }

    async generateExcel(tenantId) {
        const tenantData = await this.loadTenantData(tenantId);
        const workbook = new ExcelJS.Workbook();

        workbook.creator = "IN-Track";
        workbook.created = new Date();

        const collectionNames = Object.keys(tenantData);

        if (collectionNames.length === 0) {
            const sheet = workbook.addWorksheet("Export Summary");
            sheet.addRow(["IN-Track Tenant Export"]);
            sheet.addRow(["Tenant ID", tenantId]);
            sheet.addRow(["Result", "No tenant data found"]);
        } else {
            for (const collectionName of collectionNames) {
                const rows = tenantData[collectionName];
                const sheet = workbook.addWorksheet(
                    collectionName.substring(0, 31)
                );

                const flatRows = rows.map((row) =>
                    this.flattenDocument(row)
                );

                const columnNames = [
                    ...new Set(
                        flatRows.flatMap((row) => Object.keys(row))
                    )
                ];

                sheet.columns = columnNames.map((key) => ({
                    header: key,
                    key,
                    width: 25
                }));

                flatRows.forEach((row) => sheet.addRow(row));
                sheet.getRow(1).font = { bold: true };
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    async generatePDF(tenantId) {
        const tenantData = await this.loadTenantData(tenantId);

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 40, size: "A4" });
                const chunks = [];

                doc.on("data", (chunk) => chunks.push(chunk));
                doc.on("end", () => resolve(Buffer.concat(chunks)));
                doc.on("error", reject);

                doc.fontSize(20).text("IN-Track Tenant Data Report", {
                    align: "center"
                });
                doc.moveDown();
                doc.fontSize(10).text(`Tenant ID: ${tenantId}`);
                doc.text(`Generated: ${new Date().toLocaleString()}`);
                doc.moveDown();

                const names = Object.keys(tenantData);

                if (names.length === 0) {
                    doc.fontSize(12).text("No tenant data found.");
                } else {
                    for (const name of names) {
                        const rows = tenantData[name];
                        doc.fontSize(14).text(name);
                        doc.fontSize(10).text(`Records: ${rows.length}`);
                        doc.moveDown(0.5);

                        rows.slice(0, 50).forEach((row, index) => {
                            doc.fontSize(8).text(
                                `${index + 1}. ${JSON.stringify(row)}`
                            );
                            doc.moveDown(0.3);
                        });

                        doc.moveDown();
                    }
                }

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new ExportService();
