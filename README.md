# Simple Checkout Flow Optimizer

This project demonstrates a basic customer distribution system for checkout machines. When a new customer arrives with a certain number of items, they are assigned to the checkout machine that currently has the fewest total items in its queue.

## How it Works

The application is built with plain HTML, CSS, and JavaScript.

### Algorithm:

1.  **Initialization**: The system starts with a fixed number of checkout lanes (e.g., 3 lanes). Each lane is initially empty.
2.  **Customer Arrival**:
    *   A user inputs the number of items for a new customer via a simple form.
    *   When the "Add Customer" button is clicked:
        *   The system scans all available checkout lanes.
        *   It identifies the lane with the minimum total number of items currently in its queue.
        *   **Tie-Breaking**: If multiple lanes share the same minimum number of items, the customer is assigned to the lane with the smallest index (i.e., the "leftmost" available lane among those tied).
3.  **Queue Update**:
    *   The new customer's item count is added to the selected lane's queue (specifically, an array representing customers in that lane).
    *   The total item count for that lane is updated.
4.  **Visualization**:
    *   The UI updates dynamically to reflect the new state of the queues.
    *   Each lane is represented by a card showing its ID, total items, and a list of customers (currently represented by their item counts).
    *   A vertical bar for each lane visually indicates its load; the height of the bar is proportional to the total items in its queue relative to the busiest lane (or a fixed maximum height).
    *   The assigned lane is briefly highlighted.
5.  **Assignment Log**:
    *   An entry is added to a log, recording the customer (identified by an incrementing ID), their item count, the lane they were assigned to, and a timestamp. The log displays the most recent assignments first.

### UI Components (HTML Structure):

*   **Customer Input Form**: Allows users to enter the number of items for an incoming customer.
*   **Checkout Lanes Display**: A grid that shows each checkout lane. Each lane card displays:
    *   Lane ID.
    *   Total items in its queue.
    *   A vertical bar representing the queue length.
    *   A list of item counts for customers waiting in that lane.
*   **Assignment Log**: A list displaying a history of customer assignments.

## Files:

*   `index.html`: The main HTML file containing the structure of the page.
*   `style.css`: Contains all the CSS for styling the application, following the specified color scheme (Light gray background, Dark gray text, Teal accent).
*   `script.js`: Contains the JavaScript logic for customer assignment, queue management, and dynamic UI updates.

## Running the Application:

Simply open the `index.html` file in any modern web browser. No build process or server is required.
