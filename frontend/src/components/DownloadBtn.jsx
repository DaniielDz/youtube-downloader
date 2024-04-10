function DownloadBtn({onClickFunction, mediaOptions, text}) {

    return (
        <a 
            className=" inline-block py-2 px-7 bg-[#6174E0] rounded-tr-full rounded-bl-full" 
            href={mediaOptions.url}
            download={`${mediaOptions.title}.mp3`}
            onClick={onClickFunction}
            >
                {text}
        </a>

    

    )
}

export default DownloadBtn;