import { Controller } from "@hotwired/stimulus"
import { FetchRequest } from '@rails/request.js'

// Connects to data-controller="readability"
export default class extends Controller {
  static values = {
    url: String
  }
  
  getMetaValue(name) {
    const element = document.head.querySelector(`meta[name="${name}"]`)
    return element.getAttribute("content")
  }

  async fetchData(url) {
    try {
      // Make the request to the specified URL
      const request = new FetchRequest('get', url)
      const response = await request.perform()
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      if (response.ok) {
        const body = await response.text
      }
      
      return body;

      // // Check if the response is ok (status code 200-299)
      
      // // Parse the response body as text
      // const body = await response.text();
      
      // // Store the body in a variable
      // return body;
    } catch (error) {
      console.error('Error fetching the data:', error);
      return null;
    }
  }

  // connect() {
  // }

  fetch(event) {
    this.fetchData(this.urlValue).then(body => {
      if (body !== null) {
          console.log('Fetched data:', body);
      } else {
          console.log('Failed to fetch data.');
      }
    });

    // this.fetch(this.urlValue).then()
    // console.log(this.urlValue)
  }
}
