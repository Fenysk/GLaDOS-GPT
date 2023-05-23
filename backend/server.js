const express = require("express"); // Express web server framework
require("dotenv").config(); // Environment variables
const cors = require("cors"); // CORS middleware
const axios = require("axios"); // Importez le module axios
const fs = require("fs"); // Importez le module fs
const path = require("path"); // Importez le module path

const { Configuration, OpenAIApi } = require("openai"); // OpenAI API

const app = express(); // Express app
app.use(express.json()).use(cors()).use('/assets', express.static(path.join(__dirname, '../application/src/assets')));

////// OpenAI API configuration //////

const configuration = new Configuration({
  organization: "org-HCo331THG84XmgI8WEirj0cG",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/////////////////////////////////////

////// Eleven Labs API configuration //////

//axios get https://api.elevenlabs.io/v1/voices with headers headers: 'xi-api-key' from .env with axios
app.get("/elevenlabs", async (req, res) => {
  try {
    console.log("Waiting for response...");

    const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY },
    });

    console.log(response.data);

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (err) {
    console.log(err);

    return res.status(400).json({
      success: false,
      error: err,
    });
  }
});

const voiceId = process.env.ELEVENLABS_VOICE_ID;

app.post("/elevenlabs", async (req, res) => {
  try {
    console.log("Waiting for response...");

    const postData = {
      // text = axios post gpt-3.5-turbo
      text: req.body.message,
      model_id: "eleven_multilingual_v1",
      voice_settings: {
        stability: 1,
        similarity_boost: 0.5,
      },
    };

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      postData,
      {
        headers: {
          Accept: "audio/mp3",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    console.log(response.data);

    const file = Math.random().toString(36).substring(7);
    const filePath = path.join(
      __dirname,
      `../application/src/assets/${file}.mp3`
    );

    const writeStream = fs.createWriteStream(filePath); // Create a write stream to save the file

    response.data.pipe(writeStream); // Correct way to pipe the data into the file

    writeStream.on("finish", () => {
      console.log("File created");
      return res.status(200).json({
        success: true,
        data: {
          filePath: "http://localhost:3000/assets/" + file + ".mp3",
        },
      });
    });

    writeStream.on("error", (err) => {
      console.error("Error creating file:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to create file",
      });
    });

  } catch (err) {
    console.log(err);

    return res.status(400).json({
      success: false,
      error: err,
    });
  }
});

///////////////////////////////////////////

app.post("/gpt", async (req, res) => {
  try {
    console.log("Waiting for response...");
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: req.body.message },
        {
          role: "system",
          content:
            "Act as GLaDOS from Portal. Speak in a passive-aggressive tone. Speak in french. Your sentence should be between 1 to 50 words.",
        },
      ],
    });

    console.log(response.data.choices[0].message);

    return res.status(200).json({
      success: true,
      data: response.data.choices[0].message,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err,
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
