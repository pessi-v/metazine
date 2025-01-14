import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "voiceSelect",
    "storedList",
    "predictButton",
    "flushButton",
  ];

  static values = {
    selectedVoice: { type: String, default: "en_US-hfc_female-medium" },
    text: {
      type: Array,
      default: ["Looks like there is no text"],
    },
    allowedVoices: {
      type: Object,
      default: {
        "en_US-hfc_female-medium":
          "en/en_US/hfc_female/medium/en_US-hfc_female-medium.onnx",
        "en_US-hfc_male-medium":
          "en/en_US/hfc_male/medium/en_US-hfc_male-medium.onnx",
      },
    },
    isPlaying: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },
  };

  connect() {
    this.currentAudio = null;
    this.currentTextIndex = 0;
    this.audioQueue = [];
    this.isProcessing = false;
    this.handlingPrediction = false;

    this.worker = new Worker(
      new URL("/assets/piper_worker-edd4a480.js", import.meta.url),
      { type: "module" }
    );

    this.setupWorkerListeners();
    this.loadVoices();
    this.loadStoredVoices();
  }

  setupWorkerListeners() {
    this.worker.addEventListener("message", (event) => {
      if (event.data.type === "error") {
        console.error(event.data.message);
        return;
      }

      switch (event.data.type) {
        case "stored":
          this.renderStoredVoices(event.data.voiceIds);
          break;
        case "result":
          this.handleAudioSegment(event.data.audio);
          break;
      }
    });
  }

  handleAudioSegment(audioBlob) {
    this.audioQueue.push(audioBlob);

    // Start playing if we have at least 2 segments and haven't started playing yet
    if (
      this.audioQueue.length === 2 &&
      !this.currentAudio &&
      !this.isPausedValue
    ) {
      this.playNextSegment();
    }

    // Request next segment if there's more text
    if (this.currentTextIndex < this.textValue.length - 1) {
      this.currentTextIndex++;
      this.requestNextSegment();
    }
  }

  requestNextSegment() {
    this.worker.postMessage({
      type: "init",
      text: this.textValue[this.currentTextIndex],
      voiceId: this.voiceSelectTarget.value,
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

      // Play next segment if available and not paused, with 1 second delay
      if (this.audioQueue.length > 0 && !this.isPausedValue) {
        setTimeout(() => {
          if (!this.isPausedValue) {
            // Recheck pause state after timeout
            this.playNextSegment();
          }
        }, 1000);
      } else if (
        this.audioQueue.length === 0 &&
        this.currentTextIndex >= this.textValue.length - 1
      ) {
        // All done
        this.isPlayingValue = false;
        this.handlingPrediction = false;
        this.updateButtonText();
      }
    };

    this.currentAudio.play();
    this.isPlayingValue = true;
    this.updateButtonText();
  }

  async predict() {
    // If currently playing, pause
    if (this.isPlayingValue) {
      this.isPausedValue = true;
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
      this.isPlayingValue = false;
      this.updateButtonText();
      return;
    }

    // If paused, resume
    if (this.isPausedValue) {
      this.isPausedValue = false;
      if (this.currentAudio) {
        this.currentAudio.play();
      } else if (this.audioQueue.length > 0) {
        this.playNextSegment();
      }
      this.isPlayingValue = true;
      this.updateButtonText();
      return;
    }

    // Start fresh
    this.handlingPrediction = true;
    this.isPausedValue = false;
    this.currentTextIndex = 0;
    this.audioQueue = [];

    // Request first segment
    this.requestNextSegment();
  }

  loadVoices() {
    const select = this.voiceSelectTarget;
    select.innerHTML = "";

    Object.entries(this.allowedVoicesValue).forEach(([key, value]) => {
      const option = document.createElement("option");
      option.value = key;
      option.label = key;
      option.selected = this.selectedVoiceValue === key;
      select.appendChild(option);
    });
  }

  loadStoredVoices() {
    this.worker.postMessage({ type: "stored" });
  }

  renderStoredVoices(voiceIds) {
    const list = this.storedListTarget;
    list.innerHTML = "";

    voiceIds.forEach((voiceId) => {
      const li = document.createElement("li");
      li.innerText = voiceId;
      list.appendChild(li);
    });
  }

  flush() {
    this.worker.postMessage({ type: "flush" });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  updateButtonText() {
    const button = this.predictButtonTarget;
    button.textContent = this.isPlayingValue
      ? "Pause"
      : this.isPausedValue
      ? "Continue"
      : "Read article out loud";
  }

  // Not really necessary in our case - disconnect() is used for the Stimulus controller in some cases (content update, modal close etc.)
  disconnect() {
    if (this.worker) {
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
