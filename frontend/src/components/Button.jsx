function Button({ onClickFunction, text }) {
    return (
        <button 
        className={`h-9 lg:h-9 pl-3 pr-5  border border-solid border-l-0 text-white font-semibold 
        ${text === 'Descargar Audio' ? "bg-[#25b2f8] rounded-tr-full": 'bg-[#149eca] rounded-br-[30px]'}`}
        type="button" 
        onClick={onClickFunction}>
            {text}
        </button>
    )
}

export default Button;