function SelectField({audios, selectRef}) {
    return (
        audios.length > 0 && 
            <select className=" px-4 lg:px-7 rounded-bl-full bg-[#eef0ff] text-[#149eca] font-semibold outline-none lg:focus:rounded-none" ref={selectRef}>
                <option disabled defaultValue>Audios</option>
                {audios.map((audio, index) => (
                    <option
                        key={index} 
                        value={audio.itag}>
                            {audio.info}
                    </option>
                ))}
            </select>
    )
}

export default SelectField;