import { useState } from "react";
import axios from "axios";
import Loading from "./Loading";

const URLHOST = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

function FormVideo() {
    const [videoLink, setVideoLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [mediaOptions, setMediaOptions] = useState({ videos: [], audios: [], iframe: '' });

    const handleChange = e => setVideoLink(e.target.value);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        try {
            const videoFormatsRes = await axios.post(`${URLHOST}/api/video-formats`, { videoLink });
            const { formats } = videoFormatsRes.data.formats;
            const newMediaOptions = { videos: [], audios: [], iframe: videoFormatsRes.data.formats.videoDetails.embed.iframeUrl };

            formats.forEach(obj => {
                const { mimeType, hasVideo, hasAudio, contentLength, qualityLabel } = obj;
                const isMp4 = mimeType.includes('mp4');
                const tamañoBytes = parseInt(contentLength);
                const tamañoMB = tamañoBytes / (1024 * 1024);

                if (isNaN(tamañoMB)) return;

                if (hasVideo && isMp4) {
                    const mimeTypeWithoutCodecs = mimeType.split(';')[0].trim();
                    newMediaOptions.videos.push(`Formato: ${mimeTypeWithoutCodecs}, Calidad: ${qualityLabel}, Tamaño: ${tamañoMB.toFixed(2)}Mb`);
                } else if(hasAudio){
                    newMediaOptions.audios.push(`Audio/Mp3 Tamaño: ${tamañoMB.toFixed(2)}Mb`);
                }
            });

            setMediaOptions(newMediaOptions);

            const info = await axios.post(`${URLHOST}/api/video-info`, { videoLink });
            const download = await axios.post(`${URLHOST}/api/download-video`, { videoLink }, { responseType: 'blob' });

            const blobUrl = window.URL.createObjectURL(new Blob([download.data]));
            setMediaOptions(prevState => ({ ...prevState, title: info.data.title, url: blobUrl }));
        } catch (error) {
            console.log(error.response.data.error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mt-5 mx-auto d-flex flex-column justify-content-center align-items-center w-50">
            <form onSubmit={handleSubmit}>
                <label htmlFor="inputUrl">Ingresa la URL del video</label>
                <input type="text" id="inputUrl" value={videoLink} onChange={handleChange} />
                <button type="submit">Buscar Video</button>
                <select name="" id="">
                    {mediaOptions.videos.map((video, index) => (
                        <option key={index} value="">{video}</option>
                    ))}
                </select>
                <select name="" id="">
                    {mediaOptions.audios.map((audio, index) => (
                        <option key={index} value="">{audio}</option>
                    ))}
                </select>
            </form>
            {loading ? (
                <Loading />
            ) : (
                mediaOptions.url && <a className="btn btn-success mt-3 fs-4" href={mediaOptions.url} download={`${mediaOptions.title}.mp3`}>Guardar</a>
            )}
            {mediaOptions.iframe && <iframe className="mt-3" src={mediaOptions.iframe} width="800px" height="400px"></iframe>}
        </div>
    );
}

export default FormVideo;
