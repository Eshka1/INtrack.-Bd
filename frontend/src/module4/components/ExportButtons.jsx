import { useState } from "react";
import { useTranslation } from "react-i18next";
import { downloadTenantExport } from "../api/module4Api";

export default function ExportButtons() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState("");

  async function run(format) {
    try {
      setLoading(format);
      await downloadTenantExport(format);
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="intrack-export-buttons">
      <button
        type="button"
        className="intrack-button intrack-button--accent"
        disabled={Boolean(loading)}
        onClick={() => run("xlsx")}
      >
        {loading === "xlsx" ? "Preparing..." : `⇩ ${t("exportXlsx")}`}
      </button>

      <button
        type="button"
        className="intrack-button"
        disabled={Boolean(loading)}
        onClick={() => run("pdf")}
      >
        {loading === "pdf" ? "Preparing..." : `▣ ${t("exportPdf")}`}
      </button>
    </div>
  );
}
