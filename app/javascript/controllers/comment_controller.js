import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content", "editForm", "replyForm"]

  toggleEdit() {
    this.contentTarget.style.display = "none"
    this.editFormTarget.style.display = "block"
    // Hide reply form if it's open
    if (this.hasReplyFormTarget) {
      this.replyFormTarget.style.display = "none"
    }
  }

  cancelEdit() {
    this.contentTarget.style.display = "block"
    this.editFormTarget.style.display = "none"
  }

  toggleReply() {
    this.replyFormTarget.style.display = "block"
    // Hide edit form if it's open
    if (this.hasEditFormTarget) {
      this.editFormTarget.style.display = "none"
    }
  }

  cancelReply() {
    this.replyFormTarget.style.display = "none"
  }
}
