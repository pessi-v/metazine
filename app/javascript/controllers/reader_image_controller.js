// app/javascript/controllers/image_dimensions_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    console.log("connected");
    this.element.onload = () => {
      const ratio = this.element.naturalWidth / this.element.naturalHeight;
      const width = this.element.naturalWidth;

      this.element.style.setProperty(
        "--ratio",
        ratio > 1 ? 0.75 : ratio < 1 ? 0.333 : 0.5
      );
      this.element.style.setProperty(
        "--width",
        width > 1200 ? "'large'" : width < 400 ? "'small'" : "'medium'"
      );
    };
  }
}
