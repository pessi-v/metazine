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
  };

  connect() {
    this.worker = new Worker(
      new URL("/assets/piper_worker-7e62feb9.js", import.meta.url),
      {
        type: "module",
      }
    );
    this.setupWorkerListeners();
    this.loadVoices();
    this.loadStoredVoices();
  }

  setupWorkerListeners() {
    this.worker.addEventListener("message", (event) => {
      if (event.data.type === "debug") {
        console.log("Worker says:", event.data.message);
        return;
      }

      if (event.data.type === "error") {
        console.error(event.data.message);
        return;
      }

      switch (event.data.type) {
        case "voices":
          this.renderVoiceOptions(event.data.voices);
          break;
        case "stored":
          this.renderStoredVoices(event.data.voiceIds);
          break;
        case "result":
          this.playAudio(event.data.audio);
          break;
      }
    });
  }

  loadVoices() {
    this.worker.postMessage({ type: "voices" });
  }

  loadStoredVoices() {
    this.worker.postMessage({ type: "stored" });
  }

  renderVoiceOptions(voices) {
    const select = this.voiceSelectTarget;
    select.innerHTML = "";

    voices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = voice.key;
      option.label = voice.key;
      option.selected = this.selectedVoiceValue === voice.key;
      select.appendChild(option);
    });
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

  async predict() {
    this.handlingPrediction = true;

    // Process each text sequentially
    for (const text of this.textValue) {
      await new Promise((resolve) => {
        const messageHandler = (event) => {
          if (event.data.type === "result") {
            this.worker.removeEventListener("message", messageHandler);

            const audio = new Audio();
            audio.src = URL.createObjectURL(event.data.audio);

            audio.onended = () => {
              resolve();
            };

            audio.play();
          }
        };

        this.worker.addEventListener("message", messageHandler);

        this.worker.postMessage({
          type: "init",
          text: text,
          voiceId: this.voiceSelectTarget.value,
        });
      });
    }

    // Reset flag after all texts have been processed
    this.handlingPrediction = false;
  }

  flush() {
    this.worker.postMessage({ type: "flush" });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  playAudio(audioBlob) {
    const audio = new Audio();
    audio.src = URL.createObjectURL(audioBlob);
    audio.play();
  }

  disconnect() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
}
