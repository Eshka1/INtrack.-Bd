import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getSuperAdminCompanies,
  getSuperAdminAnalytics,
  overrideSubscription
} from "../api/module4Api";

export default function SuperAdminPanel() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [companyRows, analyticsData] = await Promise.all([
        getSuperAdminCompanies(),
        getSuperAdminAnalytics()
      ]);
      setCompanies(companyRows);
      setAnalytics(analyticsData);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeSubscription(company) {
    const id = window.prompt(
      "Enter subscription_id:",
      company.subscription_id || ""
    );

    if (!id) return;

    await overrideSubscription(company.company_id || company._id, id);
    await load();
  }

  if (error) {
    return <p className="intrack-error">{error}</p>;
  }

  return (
    <section>
      <h2 className="intrack-section-title">{t("superAdmin")}</h2>

      {analytics && (
        <div className="intrack-stats">
          <div className="intrack-stat">
            <div className="intrack-stat-label">{t("totalCompanies")}</div>
            <div className="intrack-stat-value">{analytics.totalCompanies}</div>
          </div>
          <div className="intrack-stat">
            <div className="intrack-stat-label">{t("totalSubscriptions")}</div>
            <div className="intrack-stat-value">{analytics.totalSubscriptions}</div>
          </div>
          <div className="intrack-stat">
            <div className="intrack-stat-label">{t("auditEvents24h")}</div>
            <div className="intrack-stat-value">{analytics.auditEvents24h}</div>
          </div>
          <div className="intrack-stat">
            <div className="intrack-stat-label">
              {t("zeroActivityNotifications")}
            </div>
            <div className="intrack-stat-value">
              {analytics.zeroActivityNotifications}
            </div>
          </div>
        </div>
      )}

      {!companies.length ? (
        <div className="intrack-empty">{t("noData")}</div>
      ) : (
        <div className="intrack-table-wrap">
          <table className="intrack-table">
            <thead>
              <tr>
                <th>{t("company")}</th>
                <th>{t("subscription")}</th>
                <th>{t("usage")}</th>
                <th>{t("action")}</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company._id}>
                  <td>{company.company_name}</td>
                  <td>
                    {company.subscription?.plan_name ||
                      company.subscription_id ||
                      "-"}
                  </td>
                  <td>
                    Audit: {company.usage?.auditLogs || 0} · Notifications:{" "}
                    {company.usage?.notifications || 0}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="intrack-button"
                      onClick={() => changeSubscription(company)}
                    >
                      {t("overrideSubscription")}
                    </button>
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
