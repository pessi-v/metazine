// app/javascript/controllers/image_dimensions_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    this.element.onload = () => {
      const imageWidth = this.element.naturalWidth;
      const imageHeight = this.element.naturalHeight;
      const containerWidth = this.element.parentElement.clientWidth;
      const widthRatio = imageWidth / containerWidth;
      const aspectRatio = imageWidth / imageHeight;

      // Calculate the size category
      let sizeCategory;
      if (imageWidth < 250) {
        sizeCategory = "'hide'";
      } else if (widthRatio >= 0.75) {
        sizeCategory = "'full'";
      } else {
        sizeCategory = "'center'";
      }

      this.element.style.setProperty("--width-category", sizeCategory);
      // Store whether this is a wide image (aspect ratio > 1)
      this.element.style.setProperty(
        "--is-wide",
        aspectRatio > 1 ? "'yes'" : "'no'"
      );
    };
  }
}
