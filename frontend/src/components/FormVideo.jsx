import { useState, useRef } from "react";
import axios from "axios";
import Loading from "./Loading";

const URLHOST = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

function FormVideo() {
    const [videoLink, setVideoLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [mediaOptions, setMediaOptions] = useState({ videos: [], audios: [], iframe: '' });
    const selectRef = useRef(null);

    const handleChange = e => setVideoLink(e.target.value);

    const fetchMediaOptions = async () => {
        try {
            setLoading(true);
            const videoFormatsRes = await axios.post(`${URLHOST}/api/video-formats`, { videoLink });
            const { formats } = videoFormatsRes.data.formats;
            const newMediaOptions = { videos: [], audios: [], iframe: videoFormatsRes.data.formats.videoDetails.embed.iframeUrl, formato: '' };

            formats.forEach(obj => {
                console.log(obj)
                const { hasVideo, hasAudio, contentLength, qualityLabel, itag } = obj;
                const tamañoBytes = parseInt(contentLength);
                const tamañoMB = tamañoBytes / (1024 * 1024);

                if (isNaN(tamañoMB)) return;

                if (hasVideo && hasAudio) {
                    newMediaOptions.videos.push({ info: `Calidad: ${qualityLabel}, Tamaño: ${tamañoMB.toFixed(2)}Mb`, itag, tipo: 'video' });
                } else if(hasAudio){
                    newMediaOptions.audios.push({ info: `Tamaño: ${tamañoMB.toFixed(2)}Mb`, itag, tipo: 'audio'});
                }
            });

            setMediaOptions(newMediaOptions);

        } catch (error) {
            console.log(error.response?.data?.error || 'Error interno del servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        // Obtener el valor seleccionado en el elemento select
        const selectedValue = parseInt(selectRef.current.value);
        
        // Buscar en el estado mediaOptions para determinar si es un video o un audio
        const selectedOption = mediaOptions.videos.find(video => video.itag === selectedValue) ||
                               mediaOptions.audios.find(audio => audio.itag === selectedValue);
        
        let endPoint = '';
        
        if (selectedOption.tipo === 'video') {
            mediaOptions.formato = 'mp4'
            endPoint = 'download-video'
        } else {
            mediaOptions.formato = 'mp3'
            endPoint = 'download-audio'
        }
        const itagValue = selectRef.current.value;
        const info = await axios.post(`${URLHOST}/api/video-info`, { videoLink });
        const download = await axios.post(`${URLHOST}/api/${endPoint}`, { videoLink, itagValue }, { responseType: 'blob' });
        console.log(info.data.info)
        const blobUrl = window.URL.createObjectURL(new Blob([download.data]));
        setMediaOptions(prevState => ({ ...prevState, title: info.data.title, url: blobUrl }));
    };

    return (
        <div className="mt-5 mx-auto d-flex flex-column justify-content-center align-items-center w-50">
            <form onSubmit={e => { e.preventDefault(); }}>
                <label htmlFor="inputUrl">Ingresa la URL del video</label>
                <input type="text" id="inputUrl" value={videoLink} onChange={handleChange} />
                <button type="button" onClick={fetchMediaOptions}>Buscar Video</button>
                <select ref={selectRef}>
                    <option disabled>Videos</option>
                    {mediaOptions.videos.map((video, index) => (
                        <option key={index} value={video.itag}>{video.info}</option>
                    ))}
                    <option disabled>Audios</option>
                    {mediaOptions.audios.map((audio, index) => (
                        <option key={index} value={audio.itag}>{audio.info}</option>
                    ))}
                </select>
                <button type="button" onClick={handleDownload}>Descargar Video</button>
            </form>
            {loading ? (
                <Loading />
            ) : (
                mediaOptions.url && <a className="btn btn-success mt-3 fs-4" href={mediaOptions.url} download={`${mediaOptions.title}.${mediaOptions.formato}`}>Guardar</a>
            )}
            {mediaOptions.iframe && <iframe className="mt-3" src={mediaOptions.iframe} width="600px" height="300px"></iframe>}
        </div>
    );
}

export default FormVideo;