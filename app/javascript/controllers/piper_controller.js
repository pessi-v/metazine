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
    voiceOptions: {
      type: Object,
      default: {
        "en_US-hfc_female-medium":
          "en/en_US/hfc_female/medium/en_US-hfc_female-medium.onnx",
        "en_US-hfc_male-medium":
          "en/en_US/hfc_male/medium/en_US-hfc_male-medium.onnx",
      },
      isPlaying: { type: Boolean, default: false },
      isPaused: { type: Boolean, default: false },
    },
  };

  connect() {
    this.currentAudio = null;
    this.currentTextIndex = 0;
    this.worker = new Worker(
      new URL("/assets/piper_worker-edd4a480.js", import.meta.url),
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

  async startPlayingFromIndex(index) {
    this.currentTextIndex = index;

    const processNextText = () => {
      if (
        !this.isPausedValue &&
        this.currentTextIndex < this.textValue.length
      ) {
        this.worker.postMessage({
          type: "init",
          text: this.textValue[this.currentTextIndex],
          voiceId: this.voiceSelectTarget.value,
        });
      }
    };

    const messageHandler = (event) => {
      if (event.data.type === "result" && !this.isPausedValue) {
        this.playAudio(event.data.audio, () => {
          if (!this.isPausedValue) {
            this.currentTextIndex++;
            processNextText();
          }
        });
      }
    };

    this.worker.addEventListener("message", messageHandler);
    processNextText();

    return new Promise((resolve) => {
      const checkCompletion = setInterval(() => {
        if (this.currentTextIndex >= this.textValue.length) {
          clearInterval(checkCompletion);
          this.worker.removeEventListener("message", messageHandler);
          this.handlingPrediction = false;
          this.isPlayingValue = false;
          this.updateButtonText();
          resolve();
        }
      }, 100);
    });
  }

  playAudio(audioBlob, onEnded) {
    this.currentAudio = new Audio();
    this.currentAudio.src = URL.createObjectURL(audioBlob);
    this.currentAudio.onended = onEnded;
    this.currentAudio.play();
    this.isPlayingValue = true;
    this.updateButtonText();
  }

  pauseAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.isPlayingValue = false;
      this.updateButtonText();
    }
  }

  resumeAudio() {
    if (this.currentAudio) {
      this.currentAudio.play();
      this.isPlayingValue = true;
      this.updateButtonText();
    }
  }

  updateButtonText() {
    const button = this.predictButtonTarget;
    button.textContent = this.isPlayingValue
      ? "Pause"
      : this.currentAudio && this.currentAudio.paused
      ? "Continue"
      : "Read article out loud";
  }

  loadVoices() {
    // this.worker.postMessage({ type: "voices" });

    const select = this.voiceSelectTarget;
    select.innerHTML = "";

    Object.entries(this.voiceOptionsValue).forEach(([key, value]) => {
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

  // async predict() {
  //   this.handlingPrediction = true;

  //   // Process each text sequentially
  //   for (const text of this.textValue) {
  //     await new Promise((resolve) => {
  //       const messageHandler = (event) => {
  //         if (event.data.type === "result") {
  //           this.worker.removeEventListener("message", messageHandler);

  //           const audio = new Audio();
  //           audio.src = URL.createObjectURL(event.data.audio);

  //           audio.onended = () => {
  //             resolve();
  //           };

  //           audio.play();
  //         }
  //       };

  //       this.worker.addEventListener("message", messageHandler);

  //       this.worker.postMessage({
  //         type: "init",
  //         text: text,
  //         voiceId: this.voiceSelectTarget.value,
  //       });
  //     });
  //   }

  //   // Reset flag after all texts have been processed
  //   this.handlingPrediction = false;
  // }

  // async predict() {
  //   this.handlingPrediction = true;
  //   let nextTextIndex = 0;

  //   const processNextText = () => {
  //     if (nextTextIndex < this.textValue.length) {
  //       this.worker.postMessage({
  //         type: "init",
  //         text: this.textValue[nextTextIndex],
  //         voiceId: this.voiceSelectTarget.value,
  //       });
  //     }
  //   };

  //   const messageHandler = (event) => {
  //     if (event.data.type === "result") {
  //       const audio = new Audio();
  //       audio.src = URL.createObjectURL(event.data.audio);

  //       audio.onended = () => {
  //         nextTextIndex++;
  //         processNextText();
  //       };

  //       audio.play();
  //     }
  //   };

  //   this.worker.addEventListener("message", messageHandler);
  //   processNextText();

  //   return new Promise((resolve) => {
  //     const checkCompletion = setInterval(() => {
  //       if (nextTextIndex >= this.textValue.length) {
  //         clearInterval(checkCompletion);
  //         this.worker.removeEventListener("message", messageHandler);
  //         this.handlingPrediction = false;
  //         resolve();
  //       }
  //     }, 100);
  //   });
  // }

  // async predict() {
  //   if (this.isPlayingValue) {
  //     this.pauseAudio();
  //     return;
  //   }

  //   if (
  //     this.currentAudio?.paused &&
  //     this.currentAudio.currentTime < this.currentAudio.duration
  //   ) {
  //     this.resumeAudio();
  //     return;
  //   }

  //   this.handlingPrediction = true;
  //   await this.startPlayingFromIndex(this.currentTextIndex);
  // }

  async predict() {
    if (this.isPlayingValue) {
      this.isPausedValue = true;
      this.pauseAudio();
      return;
    }

    if (
      this.currentAudio?.paused &&
      this.currentAudio.currentTime < this.currentAudio.duration
    ) {
      this.isPausedValue = false;
      this.resumeAudio();
      return;
    }

    this.handlingPrediction = true;
    this.isPausedValue = false;
    await this.startPlayingFromIndex(this.currentTextIndex);
  }

  flush() {
    this.worker.postMessage({ type: "flush" });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  // playAudio(audioBlob) {
  //   const audio = new Audio();
  //   audio.src = URL.createObjectURL(audioBlob);
  //   audio.play();
  // }

  playAudio(audioBlob, onEnded) {
    const wasPlaying = this.currentAudio && !this.currentAudio.ended;
    const previousTime = wasPlaying ? this.currentAudio.currentTime : 0;

    this.currentAudio = new Audio();
    this.currentAudio.src = URL.createObjectURL(audioBlob);
    if (wasPlaying) {
      this.currentAudio.currentTime = previousTime;
    }
    this.currentAudio.onended = onEnded;
    this.currentAudio.play();
    this.isPlayingValue = true;
    this.updateButtonText();
  }

  disconnect() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
}
