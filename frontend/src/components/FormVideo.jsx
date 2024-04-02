import { useState } from "react";
import axios from "axios";
import Loading from "./Loading";

function FormVideo() {
    const [videoLink, setVideoLink] = useState('');
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false); // Nuevo estado para el indicador de carga

    const handleChange = e => {
        setVideoLink(e.target.value);
    }

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true); // Mostrar el indicador de carga al comenzar la descarga

        try {
            const res = await axios.post('http://localhost:4000/api/video-info', { videoLink });
            const response = await axios.post('http://localhost:4000/api/download-video', { videoLink }, { responseType: 'blob' });
            setTitle(res.data.title);

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
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
                <input type="text" name="" id="inputUrl" value={videoLink} onChange={handleChange}/>
                <button type="submit">Enviar</button>
            </form>
            {loading ? (
                <Loading /> // Mostrar el indicador de carga mientras se descarga el archivo
            ) : (
                url && <a className="btn btn-success mt-3 fs-4" href={url} download={`${title}.mp3`}>Guardar</a>
            )}
        </div>
    );
}

export default FormVideo;
