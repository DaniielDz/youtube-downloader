import express from "express";
import bodyParser from "body-parser";
import ytdl from "ytdl-core";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

// Configurar CORS para permitir solicitudes solo desde un origen específico
app.use(cors())

// Ruta para manejar las solicitudes POST del frontend
app.post('/api/download-video', async (req, res) => {
    const { videoLink } = req.body;

    try {
        if(!ytdl.validateURL(videoLink)) {
            return res.status(400).json({ error: 'Enlace de video de YouTube no válido' });
        }

        // Descargar el audio utilizando ytdl-core
        const audioStream = ytdl(videoLink, { quality: 'highestaudio' });

        // Almacenar el audio en un búfer
        let audioBuffer = Buffer.from('');
        audioStream.on('data', (chunk) => {
            audioBuffer = Buffer.concat([audioBuffer, chunk]);
        });
        audioStream.on('end', () => {
            // Configurar los encabezados de la respuesta para indicar que se está enviando un audio
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
            // Enviar el audio al cliente
            res.send(audioBuffer);
        });
    }
    catch(error) {
        console.error('Error al procesar el enlace del video:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }

})

app.post('/api/video-info', async (req, res) => {
    const { videoLink } = req.body;
    try {
        if(!ytdl.validateURL(videoLink)) {
            return res.status(400).json({ error: 'Enlace de video de YouTube no válido' });
        }
        // Obtener información del video
        const videoInfo = await ytdl.getInfo(videoLink);
        const videoTitle = videoInfo.videoDetails.title;
        
        res.json({ title: videoTitle });
    }
    catch(error) {
        console.error('Error al procesar el enlace del video:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
})

app.post('/api/video-formats', async (req, res) => {
    const { videoLink } = req.body;
    try {
        if(!ytdl.validateURL(videoLink)) {
            return res.status(400).json({ error: 'Enlace de video de YouTube no válido' });
        }
        // Obtener formatos de video disponibles
        const formats = await ytdl.getInfo(videoLink);
        
        res.json({ formats });
    }
    catch(error) {
        console.error('Error al obtener los formatos del video:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
})

app.listen(PORT, () => {
    console.log(`El servidor esta funcionando en el puerto: ${PORT}`);
})