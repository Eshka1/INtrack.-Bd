import {useState} from "react";

export default function LanguageSwitcher(){

    const [language,setLanguage] =
        useState("English");


    return (

        <select
        value={language}
        onChange={(e)=>
            setLanguage(e.target.value)
        }
        >

            <option>
                English
            </option>

            <option>
                Bangla
            </option>

        </select>

    );

}