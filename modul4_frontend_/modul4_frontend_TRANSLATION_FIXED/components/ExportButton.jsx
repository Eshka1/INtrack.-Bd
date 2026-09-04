export default function ExportButton({
    label,
    onClick
}){

    return (

        <button
        className="module4-button"
        onClick={onClick}
        >

            {label}

        </button>

    );

}