import { Controller } from "@hotwired/stimulus";
import { detectWebGPU } from "detect_web_gpu";

export default class extends Controller {
  static targets = ["piper", "kokoro"];

  async connect() {
    const hasWebGPU = await detectWebGPU();

    if (hasWebGPU) {
      // Show Kokoro, hide Piper
      if (this.hasKokoroTarget) {
        this.kokoroTarget.style.display = "";
      }
      if (this.hasPiperTarget) {
        this.piperTarget.style.display = "none";
      }
      console.log("WebGPU available - showing Kokoro TTS");
    } else {
      // Show Piper, hide Kokoro
      if (this.hasPiperTarget) {
        this.piperTarget.style.display = "";
      }
      if (this.hasKokoroTarget) {
        this.kokoroTarget.style.display = "none";
      }
      console.log("WebGPU not available - showing Piper TTS");
    }
  }
}
