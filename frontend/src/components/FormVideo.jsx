import { useState } from "react";
import axios from "axios";
import Loading from "./Loading";

const URLHOST = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

function FormVideo() {
    const [videoLink, setVideoLink] = useState('');
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false); // Nuevo estado para el indicador de carga
    const [iframe, setIframe] = useState(''); // Nuevo estado para el indicador de carga

    const [videos, setVideos] = useState([]); // Utiliza useState para almacenar los videos
    const [audios, setAudios] = useState([]); // Utiliza useState para almacenar los audios

    const handleChange = e => { setVideoLink(e.target.value);}

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true); // Mostrar el indicador de carga al comenzar la descarga

        try {
            const videoFormatsRes = await axios.post(`${URLHOST}/api/video-formats`, { videoLink });
            const resultados = videoFormatsRes.data.formats.formats;
            const newVideos = []; // Array temporal para almacenar los videos
            const newAudios = []; // Array temporal para almacenar los audios

            resultados.forEach( obj => {
                let isMp4 = obj.mimeType.includes('mp4');
                if(obj.hasVideo) {  // Si es Video...
                    if(isMp4) {
                    
                        // Obtener el tamaño del archivo en bytes
                        const tamañoBytes = parseInt(obj.contentLength);
                        // Convertir el tamaño a megabytes
                        const tamañoMB = tamañoBytes / (1024 * 1024);
                        if(isNaN(tamañoMB)) { return }
    
                        // Extraer solo el tipo MIME sin los codecs
                        const mimeTypeWithoutCodecs = obj.mimeType.split(';')[0].trim();
    
                        newVideos.push(`Formato: ${mimeTypeWithoutCodecs}, Calidad: ${obj.qualityLabel}, Tamaño: ${tamañoMB.toFixed(2)}Mb`);
                    }
                }
                else{
                    // Obtener el tamaño del archivo en bytes
                    const tamañoBytes = parseInt(obj.contentLength);
                    // Convertir el tamaño a megabytes
                    const tamañoMB = tamañoBytes / (1024 * 1024);
                    if(isNaN(tamañoMB)) { return }

                    newAudios.push(`Audio/Mp3 Tamaño: ${tamañoMB.toFixed(2)}Mb`);
                }
            })

            setVideos(newVideos); // Establecer el array de videos una vez que se ha completado el proceso de carga
            setAudios(newAudios); // Establecer el array de audios una vez que se ha completado el proceso de carga
            setIframe(videoFormatsRes.data.formats.videoDetails.embed.iframeUrl)
            const info = await axios.post(`${URLHOST}/api/video-info`, { videoLink });
            const download = await axios.post(`${URLHOST}/api/download-video`, { videoLink }, { responseType: 'blob' });
            setTitle(info.data.title);
            const blobUrl = window.URL.createObjectURL(new Blob([download.data]));
            setUrl(blobUrl);
        } catch(error) {
            console.log(error.response.data.error);
        } finally {
            setLoading(false); // Ocultar el indicador de carga cuando la descarga haya terminado
        }
    }

    return ( 
        <div className="mt-5 mx-auto d-flex flex-column justify-content-center align-items-center w-50">
            <form onSubmit={handleSubmit}>
                <label htmlFor="inputUrl">Ingresa la URL del video</label>
                <input type="text" id="inputUrl" value={videoLink} onChange={handleChange}/>
                <button type="submit">Buscar Video</button>
                <select name="" id="">
                    {
                        videos.map((video, index) => (
                            <option key={index} value="">{video}</option>
                        ))
                    }
                </select>
                <select name="" id="">
                    {
                        audios.map((audio, index) => (
                            <option key={index} value="">{audio}</option>
                        ))
                    }
                </select>
            </form>
            {loading ? (
                <Loading /> // Mostrar el indicador de carga mientras se descarga el archivo
            ) : (
                url && <a className="btn btn-success mt-3 fs-4" href={url} download={`${title}.mp3`}>Guardar</a>
            )}
            <iframe className="mt-3" src={iframe} width="800px" height="400px"></iframe>
        </div>
    );
}

export default FormVideo;