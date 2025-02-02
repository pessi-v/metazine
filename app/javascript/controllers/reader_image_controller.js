// app/javascript/controllers/image_dimensions_controller.js
import { Controller } from "@hotwired/stimulus";

// export default class extends Controller {
//   connect() {
//     console.log("connected");
//     this.element.onload = () => {
//       const ratio = this.element.naturalWidth / this.element.naturalHeight;
//       const width = this.element.naturalWidth;

//       this.element.style.setProperty(
//         "--ratio",
//         ratio > 1 ? 0.75 : ratio < 1 ? 0.333 : 0.5
//       );
//       this.element.style.setProperty(
//         "--width",
//         width > 1200 ? "'large'" : width < 101 ? "'small'" : "'medium'"
//       );
//     };
//   }
// }

// export default class extends Controller {
//   connect() {
//     this.element.onload = () => {
//       const imageWidth = this.element.naturalWidth;
//       const imageHeight = this.element.naturalHeight;
//       const containerWidth = this.element.parentElement.clientWidth;
//       const widthRatio = imageWidth / containerWidth;

//       // Calculate the size category
//       let sizeCategory;
//       if (imageWidth < 101) {
//         sizeCategory = "'hide'";
//       } else if (widthRatio >= 0.75) {
//         sizeCategory = "'full'";
//       } else {
//         sizeCategory = "'center'";
//       }

//       // Set aspect ratio to constrain height
//       const aspectRatio = Math.min(imageWidth / imageHeight, 1 / 1.2);

//       this.element.style.setProperty("--width-category", sizeCategory);
//       this.element.style.setProperty("--aspect-ratio", aspectRatio);
//     };
//   }
// }

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
      if (imageWidth < 101) {
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
