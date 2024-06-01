import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="truncate"
export default class extends Controller {
  connect() {
    function truncateTextToFit(nodeObj, textAndLength) {
      if (isEmptyObject(textAndLength)) {
        return false;
      }
      for (let index = textAndLength.length; index > 1; index--) {
        let slicedString = textAndLength.text.slice(0, index);
        if (isTextFitsOnGivenLine(slicedString, nodeObj)) {
          break;
        }
      }
    }
    
    function isTextFitsOnGivenLine(slicedString, nodeObj) {
      nodeObj.textContent = slicedString + elementToAdd;
      return nodeObj.offsetHeight <= BASE_OFFSET_HEIGHT;
    }
  }
}
