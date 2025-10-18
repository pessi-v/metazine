import { Controller } from "@hotwired/stimulus";
import { detectWebGPU } from "detect_web_gpu";

export default class extends Controller {
  static targets = ["voiceSelect", "predictButton", "statusText"];

  static values = {
    selectedVoice: { type: String, default: "af_sky" },
    text: {
      type: Array,
      default: ["Hello, this is a test of the Kokoro TTS system."],
    },
    modelId: { type: String, default: "onnx-community/Kokoro-82M-v1.0-ONNX" },
    dtype: { type: String, default: "auto" }, // auto, fp32, fp16, q8, uint8, q4, q4f16
    device: { type: String, default: "auto" }, // auto, webgpu, wasm
    isPlaying: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },
    batchSize: { type: Number, default: 1 }, // Number of sentences per batch
  };

  async connect() {
    this.currentAudio = null;
    this.currentTextIndex = 0;
    this.audioQueue = [];
    this.isInitialized = false;
    this.batchedText = null; // Will store batched text segments
    this.detectedDevice = null;
    this.detectedDtype = null;
    this.isGenerating = false; // Track if currently generating to prevent duplicates
    this.playbackActive = false; // Track if playback session is active

    // Detect WebGPU availability
    await this.detectDevice();

    // Create the worker
    try {
      this.worker = new Worker(
        new URL(RAILS_ASSET_URL("../kokoro_worker.js"), import.meta.url),
        { type: "module" }
      );

      this.worker.addEventListener("error", (error) => {
        console.error("Worker error:", error);
        this.updateStatus(`Worker error: ${error.message}`);
      });

      this.setupWorkerListeners();
      this.updateStatus(`Ready (${this.detectedDevice})`);
    } catch (error) {
      console.error("Failed to create worker:", error);
      this.updateStatus(`Failed to create worker: ${error.message}`);
    }
  }

  async detectDevice() {
    // If device is explicitly set to something other than "auto", use that
    if (this.deviceValue !== "auto") {
      this.detectedDevice = this.deviceValue;
      this.detectedDtype = this.dtypeValue !== "auto" ? this.dtypeValue : "q8";
      return;
    }

    // Auto-detect WebGPU
    const hasWebGPU = await detectWebGPU();

    if (hasWebGPU) {
      this.detectedDevice = "webgpu";
      // For WebGPU, fp32 is recommended
      this.detectedDtype =
        this.dtypeValue !== "auto" ? this.dtypeValue : "fp32";
      console.log("WebGPU detected, using fp32");
    } else {
      this.detectedDevice = "wasm";
      // For WASM, q8 is more efficient
      this.detectedDtype = this.dtypeValue !== "auto" ? this.dtypeValue : "q8";
      console.log("WebGPU not available, falling back to WASM with q8");
    }
  }

  setupWorkerListeners() {
    this.worker.addEventListener("message", (event) => {
      // console.log("Worker message:", event.data);

      switch (event.data.type) {
        case "module_loaded":
          // console.log("Kokoro module loaded successfully");
          this.updateStatus("Kokoro module ready");
          break;

        case "initializing":
          this.updateStatus("Initializing TTS model...");
          break;

        case "progress":
          this.updateStatus(`Loading: ${JSON.stringify(event.data.progress)}`);
          break;

        case "initialized":
          this.isInitialized = true;
          this.updateStatus(
            event.data.cached
              ? "TTS ready (cached)"
              : "TTS initialized successfully"
          );
          // Automatically list voices after initialization
          this.listVoices();
          // Auto-start prediction after initialization
          if (!this.isPlayingValue && !this.isPausedValue) {
            setTimeout(() => this.predict(), 100);
          }
          break;

        case "voices":
          if (event.data.voices && Array.isArray(event.data.voices)) {
            this.updateStatus(
              `Available voices: ${event.data.voices.join(", ")}`
            );
            this.renderVoices(event.data.voices);
          }
          break;

        case "generating":
          this.updateStatus(`Generating speech... (${event.data.text ? event.data.text.substring(0, 50) + '...' : ''})`);
          break;

        case "audio_chunk":
          this.handleAudioChunk(event.data.audio, event.data.chunkIndex);
          break;

        case "generation_complete":
          this.handleGenerationComplete(event.data.text, event.data.totalChunks);
          break;

        case "result":
          // Legacy support for non-streaming
          this.handleAudioSegment(event.data.audio);
          break;

        case "error":
          console.error("Worker error:", event.data);
          this.updateStatus(`Error: ${event.data.message}`);
          this.isPlayingValue = false;
          this.updateButtonText();
          break;

        case "terminated":
          this.updateStatus("Worker terminated");
          break;
      }
    });
  }

  initialize() {
    if (!this.worker) {
      this.updateStatus("Worker not available");
      // console.error("Worker is not yet initialized");
      return;
    }

    this.updateStatus(
      `Requesting initialization (${this.detectedDevice}/${this.detectedDtype})...`
    );
    this.worker.postMessage({
      type: "init",
      model_id: this.modelIdValue,
      dtype: this.detectedDtype,
      device: this.detectedDevice,
    });
  }

  listVoices() {
    if (!this.isInitialized) {
      this.updateStatus("Please initialize TTS first");
      return;
    }
    if (!this.worker) {
      this.updateStatus("Worker not available");
      return;
    }
    this.worker.postMessage({ type: "list_voices" });
  }

  handleAudioChunk(audioBlob, chunkIndex) {
    console.log(`Received audio chunk ${chunkIndex}, queue size: ${this.audioQueue.length}, playbackActive: ${this.playbackActive}`);

    // Queue the audio chunk
    this.audioQueue.push(audioBlob);

    // Start playing if we haven't started the playback session yet
    if (
      this.audioQueue.length >= 1 &&
      !this.playbackActive &&
      !this.isPausedValue
    ) {
      console.log('Starting playback session');
      this.playbackActive = true;
      this.playNextSegment();
    }
  }

  handleGenerationComplete(text, totalChunks) {
    this.isGenerating = false; // Mark generation as complete
    console.log(`Generation complete: ${totalChunks} chunks for segment ${this.currentTextIndex + 1}/${this.batchedText.length}`);
    this.updateStatus(`Generated ${totalChunks} audio chunks (segment ${this.currentTextIndex + 1}/${this.batchedText.length})`);

    // Request next segment if there's more batched text
    if (this.currentTextIndex < this.batchedText.length - 1) {
      this.currentTextIndex++;
      console.log(`Requesting next segment: ${this.currentTextIndex + 1}/${this.batchedText.length}`);
      this.requestNextSegment();
    } else {
      console.log('All segments generated');
    }
  }

  handleAudioSegment(audioBlob) {
    // Legacy support for non-streaming generation
    this.audioQueue.push(audioBlob);

    // Start playing if we have at least 1 segment and haven't started playing yet
    if (
      this.audioQueue.length >= 1 &&
      !this.currentAudio &&
      !this.isPausedValue
    ) {
      this.playNextSegment();
    }

    // Request next segment if there's more batched text
    if (this.currentTextIndex < this.batchedText.length - 1) {
      this.currentTextIndex++;
      this.requestNextSegment();
    }
  }

  requestNextSegment() {
    if (!this.isInitialized) {
      this.updateStatus("TTS not initialized. Click 'Initialize' first.");
      return;
    }

    if (!this.worker) {
      this.updateStatus("Worker not available");
      return;
    }

    // Prevent duplicate generation requests
    if (this.isGenerating) {
      console.log('Already generating, skipping duplicate request');
      return;
    }

    this.isGenerating = true;
    const textToGenerate = this.batchedText[this.currentTextIndex];
    console.log(`Requesting generation for segment ${this.currentTextIndex + 1}: "${textToGenerate.substring(0, 50)}..."`);

    this.worker.postMessage({
      type: "generate",
      text: textToGenerate,
      voice: this.selectedVoiceValue,
    });
  }

  // Batch text into groups of N sentences
  batchTextSegments() {
    const batchSize = this.batchSizeValue;
    const batches = [];

    for (let i = 0; i < this.textValue.length; i += batchSize) {
      const batch = this.textValue.slice(i, i + batchSize).join(" ");
      batches.push(batch);
    }

    return batches;
  }

  playNextSegment() {
    if (this.audioQueue.length === 0 || this.isPausedValue) {
      // If queue is empty and we're not paused, end the playback session
      if (this.audioQueue.length === 0 && !this.isPausedValue) {
        this.playbackActive = false;
        console.log('Playback session ended (queue empty)');
      }
      return;
    }

    const audioBlob = this.audioQueue.shift(); // Remove from queue immediately
    this.currentAudio = new Audio();
    this.currentAudio.src = URL.createObjectURL(audioBlob);

    this.currentAudio.onended = () => {
      URL.revokeObjectURL(this.currentAudio.src);
      this.currentAudio = null;

      // Play next segment if available and not paused
      if (this.audioQueue.length > 0 && !this.isPausedValue) {
        setTimeout(() => {
          if (!this.isPausedValue) {
            this.playNextSegment();
          }
        }, 500);
      } else if (this.audioQueue.length === 0) {
        // Queue is empty
        if (this.currentTextIndex >= this.batchedText.length - 1 && !this.isGenerating) {
          // All done - no more segments to generate
          this.isPlayingValue = false;
          this.playbackActive = false;
          this.updateStatus("Playback completed");
          this.updateButtonText();
          console.log('Playback session completed');
        } else {
          // More segments coming, but queue is empty - pause the session so new chunks can restart it
          this.playbackActive = false;
          console.log('Playback session paused - waiting for next segment chunks');
        }
      }
    };

    this.currentAudio.play();
    this.isPlayingValue = true;
    this.updateStatus("Playing...");
    this.updateButtonText();
  }

  async predict() {
    // Auto-initialize if not yet initialized
    if (!this.isInitialized) {
      this.updateButtonText("Preparing...");
      this.initialize();
      return;
    }

    // If currently playing, pause
    if (this.isPlayingValue) {
      this.isPausedValue = true;
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
      this.isPlayingValue = false;
      this.playbackActive = false; // Pause the session
      this.updateStatus("Paused");
      this.updateButtonText();
      console.log('Playback paused');
      return;
    }

    // If paused, resume
    if (this.isPausedValue) {
      this.isPausedValue = false;
      if (this.currentAudio) {
        this.currentAudio.play();
        this.updateStatus("Resumed playback");
        this.playbackActive = true;
      } else if (this.audioQueue.length > 0) {
        this.playbackActive = true;
        this.playNextSegment();
      }
      this.isPlayingValue = true;
      this.updateButtonText();
      console.log('Playback resumed');
      return;
    }

    // Start fresh
    this.isPausedValue = false;
    this.currentTextIndex = 0;
    this.audioQueue = [];
    this.isGenerating = false; // Reset generation flag
    this.playbackActive = false; // Reset playback flag

    // Batch the text segments
    this.batchedText = this.batchTextSegments();

    console.log(`Starting generation: ${this.batchedText.length} batches of ~${this.batchSizeValue} sentences`);
    this.updateStatus(
      `Starting generation... (${this.batchedText.length} batches of ~${this.batchSizeValue} sentences)`
    );
    this.predictButtonTarget.textContent = "Preparing...";

    // Request first segment
    this.requestNextSegment();
  }

  renderVoices(voices) {
    if (!this.hasVoiceSelectTarget) return;

    const select = this.voiceSelectTarget;
    select.innerHTML = "";

    voices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = voice;
      option.label = voice;
      option.selected = this.selectedVoiceValue === voice;
      select.appendChild(option);
    });
  }

  updateStatus(message) {
    // console.log("Status:", message);
    if (this.hasStatusTextTarget) {
      this.statusTextTarget.textContent = message;
    }
  }

  updateButtonText(text = null) {
    if (!this.hasPredictButtonTarget) return;

    const button = this.predictButtonTarget;
    if (text) {
      button.textContent = text;
    } else {
      button.textContent = this.isPlayingValue
        ? "Pause ⏸"
        : this.isPausedValue
          ? "Resume ⏵"
          : "Kokoro";
    }
  }

  voiceChanged(event) {
    this.selectedVoiceValue = event.target.value;
    this.updateStatus(`Voice changed to: ${this.selectedVoiceValue}`);
  }

  disconnect() {
    if (this.worker) {
      this.worker.postMessage({ type: "terminate" });
      this.worker.terminate();
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      URL.revokeObjectURL(this.currentAudio.src);
    }
    this.audioQueue.forEach((blob) => {
      URL.revokeObjectURL(URL.createObjectURL(blob));
    });
  }
}
