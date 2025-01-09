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
        "en_GB-alan-low": "en/en_GB/alan/low/en_GB-alan-low.onnx",
        "en_GB-alan-medium": "en/en_GB/alan/medium/en_GB-alan-medium.onnx",
        "en_GB-alba-medium": "en/en_GB/alba/medium/en_GB-alba-medium.onnx",
        "en_GB-aru-medium": "en/en_GB/aru/medium/en_GB-aru-medium.onnx",
        "en_GB-cori-high": "en/en_GB/cori/high/en_GB-cori-high.onnx",
        "en_GB-cori-medium": "en/en_GB/cori/medium/en_GB-cori-medium.onnx",
        "en_GB-jenny_dioco-medium":
          "en/en_GB/jenny_dioco/medium/en_GB-jenny_dioco-medium.onnx",
        "en_GB-northern_english_male-medium":
          "en/en_GB/northern_english_male/medium/en_GB-northern_english_male-medium.onnx",
        "en_GB-semaine-medium":
          "en/en_GB/semaine/medium/en_GB-semaine-medium.onnx",
        "en_GB-southern_english_female-low":
          "en/en_GB/southern_english_female/low/en_GB-southern_english_female-low.onnx",
        "en_GB-vctk-medium": "en/en_GB/vctk/medium/en_GB-vctk-medium.onnx",
        "en_US-amy-low": "en/en_US/amy/low/en_US-amy-low.onnx",
        "en_US-amy-medium": "en/en_US/amy/medium/en_US-amy-medium.onnx",
        "en_US-arctic-medium":
          "en/en_US/arctic/medium/en_US-arctic-medium.onnx",
        "en_US-danny-low": "en/en_US/danny/low/en_US-danny-low.onnx",
        "en_US-hfc_female-medium":
          "en/en_US/hfc_female/medium/en_US-hfc_female-medium.onnx",
        "en_US-hfc_male-medium":
          "en/en_US/hfc_male/medium/en_US-hfc_male-medium.onnx",
        "en_US-joe-medium": "en/en_US/joe/medium/en_US-joe-medium.onnx",
        "en_US-kathleen-low": "en/en_US/kathleen/low/en_US-kathleen-low.onnx",
        "en_US-kristin-medium":
          "en/en_US/kristin/medium/en_US-kristin-medium.onnx",
        "en_US-kusal-medium": "en/en_US/kusal/medium/en_US-kusal-medium.onnx",
        "en_US-l2arctic-medium":
          "en/en_US/l2arctic/medium/en_US-l2arctic-medium.onnx",
        "en_US-lessac-high": "en/en_US/lessac/high/en_US-lessac-high.onnx",
        "en_US-lessac-low": "en/en_US/lessac/low/en_US-lessac-low.onnx",
        "en_US-lessac-medium":
          "en/en_US/lessac/medium/en_US-lessac-medium.onnx",
        "en_US-ljspeech-high":
          "en/en_US/ljspeech/high/en_US-ljspeech-high.onnx",
        "en_US-ljspeech-medium":
          "en/en_US/ljspeech/medium/en_US-ljspeech-medium.onnx",
        "en_US-ryan-high": "en/en_US/ryan/high/en_US-ryan-high.onnx",
        "en_US-ryan-low": "en/en_US/ryan/low/en_US-ryan-low.onnx",
      },
    },
  };

  connect() {
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

  async predict() {
    this.handlingPrediction = true;
    let nextTextIndex = 0;

    const processNextText = () => {
      if (nextTextIndex < this.textValue.length) {
        this.worker.postMessage({
          type: "init",
          text: this.textValue[nextTextIndex],
          voiceId: this.voiceSelectTarget.value,
        });
      }
    };

    const messageHandler = (event) => {
      if (event.data.type === "result") {
        const audio = new Audio();
        audio.src = URL.createObjectURL(event.data.audio);

        audio.onended = () => {
          nextTextIndex++;
          processNextText();
        };

        audio.play();
      }
    };

    this.worker.addEventListener("message", messageHandler);
    processNextText();

    return new Promise((resolve) => {
      const checkCompletion = setInterval(() => {
        if (nextTextIndex >= this.textValue.length) {
          clearInterval(checkCompletion);
          this.worker.removeEventListener("message", messageHandler);
          this.handlingPrediction = false;
          resolve();
        }
      }, 100);
    });
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
