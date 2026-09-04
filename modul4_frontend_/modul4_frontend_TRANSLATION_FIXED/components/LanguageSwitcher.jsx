import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language?.startsWith("bn") ? "bn" : "en";

  const changeLanguage = async (event) => {
    const language = event.target.value;
    await i18n.changeLanguage(language);
    localStorage.setItem("intrack_language", language);
  };

  return (
    <label style={{display:"flex",alignItems:"center",gap:"8px",fontWeight:600}}>
      <span>{t("language")}:</span>
      <select value={currentLanguage} onChange={changeLanguage} style={{padding:"8px 10px",borderRadius:"8px"}}>
        <option value="en">{t("english")}</option>
        <option value="bn">{t("bangla")}</option>
      </select>
    </label>
  );
}
