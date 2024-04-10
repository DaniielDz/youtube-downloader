import { useState, useRef } from "react";
import axios from "axios";
import Loading from "./Loading";
import Button from "./Button";
import SelectField from "./SelectField";
import DownloadBtn from "./DownloadBtn";
import Iframe from "./Iframe";

const URLHOST = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

function FormVideo() {
    const [videoLink, setVideoLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingDownload, setLoadingDownload] = useState(false);
    const [mediaOptions, setMediaOptions] = useState({ audios: [], iframe: '' });
    const [error, setError] = useState('');
    const selectRef = useRef(null);

    const handleChange = e => setVideoLink(e.target.value);

    const fetchMediaOptions = async () => {
        
        try {
            setMediaOptions({ audios: [], iframe: '' });
            setError('')
            setLoading(true);
            const videoFormatsRes = await axios.post(`${URLHOST}/api/video-formats`, { videoLink });
            const { formats } = videoFormatsRes.data.formats;
            const newMediaOptions = { audios: [], iframe: videoFormatsRes.data.formats.videoDetails.embed.iframeUrl};

            formats.forEach(obj => {
                const { hasAudio, contentLength, itag } = obj;
                const tamañoBytes = parseInt(contentLength);
                const tamañoMB = tamañoBytes / (1024 * 1024);

                if (isNaN(tamañoMB)) return;

                if(hasAudio){ newMediaOptions.audios.push({ info: `Tamaño: ${tamañoMB.toFixed(2)}Mb`, itag}); }
            });

            setMediaOptions(newMediaOptions);

        } catch (error) {
            setError(error.response?.data?.error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            setLoadingDownload(true);
            mediaOptions.audios = [];
            
            // Obtener el valor seleccionado en el elemento select
            const itagValue = parseInt(selectRef.current.value);
            const info = await axios.post(`${URLHOST}/api/video-info`, { videoLink });
            const download = await axios.post(`${URLHOST}/api/download-audio`, { videoLink, itagValue }, { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([download.data]));
            setMediaOptions(prevState => ({ ...prevState, title: info.data.title, url: blobUrl }));
        }
        finally {
            setLoadingDownload(false)
        }

    };

    return (
        <div className="flex flex-col justify-center items-center mt-20 text-[#EEF5FF]">
            <form  
            className="flex flex-col items-center gap-4"
            onSubmit={e => { e.preventDefault(); }}>
                <div className="flex items-center">
                    <input className="w-[200px] lg:w-[400px] h-9 py-2 px-5 text-sm rounded-tl-[30px] bg-[#333a45] border border-solid text-white border-[#f6f7f9] border-r-[.5px] outline-none"
                    type="text" id="inputUrl" value={videoLink} onChange={handleChange}  autoComplete="off" placeholder="Pegue aquí el link"/>
                    <Button onClickFunction={fetchMediaOptions} text={"Buscar Video"}/>
                </div>
                {error && <p className=" text-red-600 font-semibold text-lg">{error}</p>}
                <div className="flex justify-center">
                    <SelectField audios={mediaOptions.audios} selectRef={selectRef}/>
                    {
                        mediaOptions.url ? (
                            <DownloadBtn mediaOptions={mediaOptions} text={"Guardar Audio"}/>
                        ) : (
                            <>
                                {loading && <Loading text={'Buscando el video...'}/>}
                                {loadingDownload && <Loading text={'Descargando el audio...'}/> }

                                {mediaOptions.audios.length > 0 && <Button onClickFunction={handleDownload} text={"Descargar Audio"} />}
                            </>
                        )
                    }
                </div>
            </form>
            <Iframe mediaOptions={mediaOptions} />
        </div>
    );
}

export default FormVideo;