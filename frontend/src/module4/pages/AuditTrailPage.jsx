import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAuditLogs } from "../api/module4Api";

export default function AuditTrailPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuditLogs()
      .then((result) => setLogs(result.items || []))
      .catch((requestError) =>
        setError(requestError.response?.data?.message || requestError.message)
      );
  }, []);

  if (error) {
    return <p className="intrack-error">{error}</p>;
  }

  return (
    <section>
      <h2 className="intrack-section-title">{t("auditTrail")}</h2>

      {!logs.length ? (
        <div className="intrack-empty">{t("noData")}</div>
      ) : (
        <div className="intrack-table-wrap">
          <table className="intrack-table">
            <thead>
              <tr>
                <th>{t("timestamp")}</th>
                <th>{t("actor")}</th>
                <th>{t("entity")}</th>
                <th>{t("action")}</th>
                <th>{t("before")}</th>
                <th>{t("after")}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.actor?.name || log.actor?.id}</td>
                  <td>{log.entityType}</td>
                  <td>{log.action}</td>
                  <td>
                    <pre className="intrack-pre">
                      {JSON.stringify(log.before, null, 2)}
                    </pre>
                  </td>
                  <td>
                    <pre className="intrack-pre">
                      {JSON.stringify(log.after, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
