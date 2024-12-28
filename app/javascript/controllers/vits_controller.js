import { Controller } from "@hotwired/stimulus";
import * as tts from "@diffusionstudio/vits-web";

// Connects to data-controller="vits"
export default class extends Controller {
  static values = {
    text: String,
    voiceId: String,
  };

  // You can trigger this via data-action="text-to-speech#generateSpeech"
  async generateSpeech() {
    const start = performance.now();

    try {
      const blob = await tts.predict({
        text: this.textValue,
        voiceId: this.voiceIdValue,
      });

      console.log("Time taken:", performance.now() - start + " ms");

      // Handle the audio blob - for example, create an audio element and play it
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();

      // Clean up the URL after use
      audio.onended = () => URL.revokeObjectURL(audioUrl);

      // Dispatch a custom event if needed
      this.dispatch("speechGenerated", { detail: { blob } });
    } catch (error) {
      console.error("Speech generation failed:", error);
      this.dispatch("speechError", { detail: { error } });
    }
  }
}
