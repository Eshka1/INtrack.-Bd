const mongoose = require("mongoose");

const ExportHistorySchema = new mongoose.Schema({

    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    exportType: {
        type: String,
        enum: [
            "EXCEL",
            "PDF"
        ],
        required: true
    },

    fileName: {
        type: String,
        required: true
    },

    filePath: {
        type: String,
        required: true
    },

    collectionName: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: [
            "SUCCESS",
            "FAILED"
        ],
        default: "SUCCESS"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});


module.exports = mongoose.model(
    "ExportHistory",
    ExportHistorySchema
);