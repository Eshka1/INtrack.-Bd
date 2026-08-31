import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  async function changeLanguage(event) {
    const language = event.target.value;
    await i18n.changeLanguage(language);
    localStorage.setItem("intrack_language", language);
  }

  return (
    <label className="intrack-control">
      <span>{t("language")}</span>
      <select
        className="intrack-select"
        value={i18n.language}
        onChange={changeLanguage}
      >
        <option value="en">English</option>
        <option value="bn">বাংলা</option>
      </select>
    </label>
  );
}
