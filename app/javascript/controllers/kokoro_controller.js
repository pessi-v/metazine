import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["voiceSelect", "predictButton", "statusText"];

  static values = {
    selectedVoice: { type: String, default: "af_sky" },
    text: {
      type: Array,
      default: ["Hello, this is a test of the Kokoro TTS system."],
    },
    modelId: { type: String, default: "onnx-community/Kokoro-82M-v1.0-ONNX" },
    dtype: { type: String, default: "q8" },
    device: { type: String, default: "wasm" },
    isPlaying: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },
  };

  connect() {
    this.currentAudio = null;
    this.currentTextIndex = 0;
    this.audioQueue = [];
    this.isInitialized = false;

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
      this.updateStatus("Ready to initialize");
    } catch (error) {
      console.error("Failed to create worker:", error);
      this.updateStatus(`Failed to create worker: ${error.message}`);
    }
  }

  setupWorkerListeners() {
    this.worker.addEventListener("message", (event) => {
      console.log("Worker message:", event.data);

      switch (event.data.type) {
        case "module_loaded":
          console.log("Kokoro module loaded successfully");
          this.updateStatus("Kokoro module ready");
          break;

        case "initializing":
          this.updateStatus("Initializing TTS model...");
          break;

        case "progress":
          this.updateStatus(
            `Loading: ${JSON.stringify(event.data.progress)}`
          );
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
          this.updateStatus(`Available voices: ${event.data.voices.join(", ")}`);
          this.renderVoices(event.data.voices);
          break;

        case "generating":
          this.updateStatus("Generating speech...");
          break;

        case "result":
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
      console.error("Worker is not initialized");
      return;
    }

    this.updateStatus("Requesting initialization...");
    this.worker.postMessage({
      type: "init",
      model_id: this.modelIdValue,
      dtype: this.dtypeValue,
      device: this.deviceValue,
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

  handleAudioSegment(audioBlob) {
    this.audioQueue.push(audioBlob);

    // Start playing if we have at least 1 segment and haven't started playing yet
    if (this.audioQueue.length >= 1 && !this.currentAudio && !this.isPausedValue) {
      this.playNextSegment();
    }

    // Request next segment if there's more text
    if (this.currentTextIndex < this.textValue.length - 1) {
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

    this.worker.postMessage({
      type: "generate",
      text: this.textValue[this.currentTextIndex],
      voice: this.selectedVoiceValue,
    });
  }

  playNextSegment() {
    if (this.audioQueue.length === 0 || this.isPausedValue) {
      return;
    }

    const audioBlob = this.audioQueue[0];
    this.currentAudio = new Audio();
    this.currentAudio.src = URL.createObjectURL(audioBlob);

    this.currentAudio.onended = () => {
      // Remove the played segment
      this.audioQueue.shift();
      URL.revokeObjectURL(this.currentAudio.src);
      this.currentAudio = null;

      // Play next segment if available and not paused
      if (this.audioQueue.length > 0 && !this.isPausedValue) {
        setTimeout(() => {
          if (!this.isPausedValue) {
            this.playNextSegment();
          }
        }, 500);
      } else if (
        this.audioQueue.length === 0 &&
        this.currentTextIndex >= this.textValue.length - 1
      ) {
        // All done
        this.isPlayingValue = false;
        this.updateStatus("Playback completed");
        this.updateButtonText();
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
      this.updateButtonText("Initializing...");
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
      this.updateStatus("Paused");
      this.updateButtonText();
      return;
    }

    // If paused, resume
    if (this.isPausedValue) {
      this.isPausedValue = false;
      if (this.currentAudio) {
        this.currentAudio.play();
        this.updateStatus("Resumed playback");
      } else if (this.audioQueue.length > 0) {
        this.playNextSegment();
      }
      this.isPlayingValue = true;
      this.updateButtonText();
      return;
    }

    // Start fresh
    this.isPausedValue = false;
    this.currentTextIndex = 0;
    this.audioQueue = [];
    this.updateStatus("Starting generation...");
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
    console.log("Status:", message);
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
