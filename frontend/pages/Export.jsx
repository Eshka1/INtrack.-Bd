import { useState } from "react";
import {
    exportExcel,
    exportPDF
} from "../api/module4Api";


export default function Export(){

    const [loading,setLoading] = useState(false);
    const [error,setError] = useState("");



    const downloadFile = async(type)=>{

        try{

            setLoading(true);
            setError("");


            const response =
                type === "excel"
                ? await exportExcel()
                : await exportPDF();



            const blob =
                new Blob(
                    [response],
                    {
                        type:
                        type === "excel"
                        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        : "application/pdf"
                    }
                );


            const url =
                window.URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;


            link.download =
                type === "excel"
                ? "INTrack_export.xlsx"
                : "INTrack_export.pdf";


            document.body.appendChild(link);


            link.click();


            link.remove();


            window.URL.revokeObjectURL(url);


        }
        catch(err){

            setError(
                "Export failed. Please try again."
            );

        }
        finally{

            setLoading(false);

        }

    };



    return (

        <div className="module4-card">


            <h2>
                Data Export Infrastructure
            </h2>


            <p className="module4-muted">
                Download tenant data reports in Excel or PDF format.
            </p>



            {
                error &&
                <div className="module4-error">
                    {error}
                </div>
            }



            <div className="module4-export-actions">


                <button
                    disabled={loading}
                    onClick={()=>
                        downloadFile("excel")
                    }
                >

                    Export Excel

                </button>



                <button
                    disabled={loading}
                    onClick={()=>
                        downloadFile("pdf")
                    }
                >

                    Export PDF

                </button>


            </div>



            {
                loading &&
                <p>
                    Generating file...
                </p>
            }


        </div>

    );

}