function Iframe ({mediaOptions}) {

    return(
        mediaOptions.iframe && 
            <iframe 
                className="mt-6 w-[340px] h-[170px] lg:w-[600px] lg:h-[300px]" 
                src={mediaOptions.iframe}>
            </iframe>
    )
}

export default Iframe;