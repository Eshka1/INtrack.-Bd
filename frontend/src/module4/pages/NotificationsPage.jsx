import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getNotifications, markNotificationRead } from "../api/module4Api";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  async function load() {
    setItems(await getNotifications());
  }

  useEffect(() => {
    load();
  }, []);

  async function read(id) {
    await markNotificationRead(id);
    await load();
  }

  return (
    <section>
      <h2 className="intrack-section-title">{t("notifications")}</h2>

      {!items.length ? (
        <div className="intrack-empty">{t("noData")}</div>
      ) : (
        <div className="intrack-card-list">
          {items.map((notification) => (
            <article className="intrack-notification" key={notification._id}>
              <div className="intrack-notification-icon" aria-hidden="true">
                !
              </div>
              <div>
                <strong>{notification.type}</strong>
                <p className="intrack-muted">{notification.message}</p>
                <small className="intrack-muted">
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </div>
              {!notification.read && (
                <button
                  type="button"
                  className="intrack-button"
                  onClick={() => read(notification._id)}
                >
                  {t("markRead")}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
