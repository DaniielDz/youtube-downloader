function DownloadBtn({onClickFunction, mediaOptions, text}) {

    return (
        <a 
            className=" inline-block py-3 px-6 bg-[#25b2f8] rounded-tr-full" 
            href={mediaOptions.url}
            download={`${mediaOptions.title}.mp3`}
            onClick={onClickFunction}
            >
                {text}
        </a>

    

    )
}

export default DownloadBtn;