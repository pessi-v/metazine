let KokoroTTS = null;
let TextSplitterStream = null;
let ttsInstance = null;
let isInitialized = false;

// Try to import KokoroTTS with error handling
(async () => {
  try {
    const module = await import(RAILS_ASSET_URL("./kokoro.js"));
    KokoroTTS = module.KokoroTTS;
    TextSplitterStream = module.TextSplitterStream;
    self.postMessage({ type: "module_loaded" });
  } catch (error) {
    self.postMessage({
      type: "error",
      message: `Failed to load Kokoro module: ${error.message}`,
      stack: error.stack,
    });
  }
})();

self.onmessage = async function (event) {
  try {
    // Handle different message types
    if (event.data.type === "init") {
      await initializeTTS(event.data);
      return;
    }

    if (event.data.type === "generate") {
      await generateSpeech(event.data);
      return;
    }

    if (event.data.type === "list_voices") {
      await listVoices();
      return;
    }

    if (event.data.type === "terminate") {
      ttsInstance = null;
      isInitialized = false;
      self.postMessage({ type: "terminated" });
      return;
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error.message,
      stack: error.stack,
    });
  }
};

async function initializeTTS(config) {
  try {
    if (!KokoroTTS) {
      self.postMessage({
        type: "error",
        message: "Kokoro module not loaded yet. Please wait.",
      });
      return;
    }

    if (isInitialized && ttsInstance) {
      self.postMessage({ type: "initialized", cached: true });
      return;
    }

    self.postMessage({ type: "initializing" });

    const model_id = config.model_id || "onnx-community/Kokoro-82M-v1.0-ONNX";
    const dtype = config.dtype || "q8"; // Options: "fp32", "fp16", "q8", "q4", "q4f16"
    const device = config.device || "wasm"; // Options: "wasm", "webgpu"

    ttsInstance = await KokoroTTS.from_pretrained(model_id, {
      dtype,
      device,
      progress_callback: (progress) => {
        self.postMessage({
          type: "progress",
          progress: progress,
        });
      },
    });

    isInitialized = true;
    self.postMessage({ type: "initialized", cached: false });
  } catch (error) {
    self.postMessage({
      type: "error",
      message: `Initialization failed: ${error.message}`,
      stack: error.stack,
    });
  }
}

async function generateSpeech(config) {
  try {
    if (!isInitialized || !ttsInstance) {
      self.postMessage({
        type: "error",
        message: "TTS not initialized. Send init message first.",
      });
      return;
    }

    if (!TextSplitterStream) {
      self.postMessage({
        type: "error",
        message: "TextSplitterStream not loaded.",
      });
      return;
    }

    const text = config.text || "";
    const voice = config.voice || "af_sky";

    if (!text) {
      self.postMessage({
        type: "error",
        message: "No text provided for generation",
      });
      return;
    }

    self.postMessage({ type: "generating", text: text });

    // Set up the streaming pipeline
    const splitter = new TextSplitterStream();
    const stream = ttsInstance.stream(splitter, { voice });

    // Process the stream and send audio chunks as they're generated
    let chunkIndex = 0;
    const streamProcessor = (async () => {
      try {
        for await (const { text: chunkText, phonemes, audio } of stream) {
          // Convert to WAV blob
          const wavBlob = await audio.toBlob();

          self.postMessage({
            type: "audio_chunk",
            audio: wavBlob,
            chunkIndex: chunkIndex++,
            chunkText: chunkText,
          });
        }

        // Signal that streaming is complete for this text
        self.postMessage({
          type: "generation_complete",
          text: text,
          totalChunks: chunkIndex,
        });
      } catch (error) {
        self.postMessage({
          type: "error",
          message: `Stream processing failed: ${error.message}`,
          stack: error.stack,
        });
      }
    })();

    // Push text to the splitter word by word to enable streaming
    const tokens = text.match(/\s*\S+/g) || [text];
    for (const token of tokens) {
      splitter.push(token);
      await new Promise((resolve) => setTimeout(resolve, 1)); // Small delay to allow streaming
    }

    // Close the splitter to signal no more text
    splitter.close();

    // Wait for stream processing to complete
    await streamProcessor;
  } catch (error) {
    self.postMessage({
      type: "error",
      message: `Generation failed: ${error.message}`,
      stack: error.stack,
    });
  }
}

async function listVoices() {
  try {
    if (!isInitialized || !ttsInstance) {
      self.postMessage({
        type: "error",
        message: "TTS not initialized. Send init message first.",
      });
      return;
    }

    // list_voices() returns undefined, voices are shown in console.table
    // For now, just send back a hardcoded list of known voices
    const voices = [
      "af_heart", "af_alloy", "af_aoede", "af_bella", "af_jessica",
      "af_kore", "af_nicole", "af_nova", "af_river", "af_sarah",
      "af_sky", "am_adam", "am_echo", "am_eric", "am_fenrir",
      "am_liam", "am_michael", "am_onyx", "am_puck", "am_santa",
      "bf_emma", "bf_isabella", "bm_george", "bm_lewis",
      "bf_alice", "bf_lily", "bm_daniel", "bm_fable"
    ];

    self.postMessage({
      type: "voices",
      voices: voices,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      message: `Failed to list voices: ${error.message}`,
      stack: error.stack,
    });
  }
}
