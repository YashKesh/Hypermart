document.addEventListener('DOMContentLoaded', () => {
    const lanesContainer = document.getElementById('lanes-container');
    const logList = document.getElementById('log-list');
    const customerForm = document.getElementById('customer-form');
    const itemCountInput = document.getElementById('item-count');

    const INITIAL_LANE_COUNT = 3;
    // MAX_BAR_HEIGHT_PX is implicitly set by .queue-bar-container height in CSS (160px)

    let lanes = [];
    let logEntries = [];
    let nextCustomerId = 1;
    let highlightedLaneId = null;
    let highlightTimeout = null;

    function initializeLanes(count) {
        lanes = [];
        for (let i = 1; i <= count; i++) {
            lanes.push({
                id: i,
                itemsQueue: [], // Stores item counts of customers in this lane
                totalItemsInQueue: 0,
            });
        }
        logEntries = [];
        nextCustomerId = 1;
        renderLanes();
        renderLog();
    }

    function renderLanes() {
        lanesContainer.innerHTML = ''; // Clear existing lanes
        
        const maxItemsInAnyLane = Math.max(1, ...lanes.map(lane => lane.totalItemsInQueue));

        lanes.forEach(lane => {
            const laneDiv = document.createElement('div');
            laneDiv.classList.add('lane');
            laneDiv.setAttribute('id', `lane-${lane.id}`);
            if (lane.id === highlightedLaneId) {
                laneDiv.classList.add('highlighted');
            }

            const title = document.createElement('h3');
            title.classList.add('lane-title');
            title.textContent = `Checkout Lane ${lane.id}`;
            laneDiv.appendChild(title);

            const totalItemsP = document.createElement('p');
            totalItemsP.innerHTML = `Total Items: <strong>${lane.totalItemsInQueue}</strong>`;
            laneDiv.appendChild(totalItemsP);

            const barContainer = document.createElement('div');
            barContainer.classList.add('queue-bar-container');
            const bar = document.createElement('div');
            bar.classList.add('queue-bar');
            
            let barHeightPercentage = 0;
            if (maxItemsInAnyLane > 0) { // Avoid division by zero if all lanes are empty
                 barHeightPercentage = (lane.totalItemsInQueue / maxItemsInAnyLane) * 100;
            }
            // Ensure bar is visible even for small amounts relative to max, but not if queue is empty
            if (lane.totalItemsInQueue > 0 && barHeightPercentage < 5) {
                 barHeightPercentage = 5; // Minimum 5% height if not empty
            }
            const cappedBarHeight = Math.min(100, barHeightPercentage);
            bar.style.height = `${cappedBarHeight}%`;
            
            barContainer.appendChild(bar);
            laneDiv.appendChild(barContainer);
            
            const customersTitle = document.createElement('h4');
            customersTitle.textContent = 'Customers in Queue:';
            laneDiv.appendChild(customersTitle);

            const customerListUl = document.createElement('ul');
            customerListUl.classList.add('customer-list');
            if (lane.itemsQueue.length === 0) {
                const emptyLi = document.createElement('li');
                emptyLi.classList.add('empty-queue');
                emptyLi.textContent = 'Empty';
                customerListUl.appendChild(emptyLi);
            } else {
                lane.itemsQueue.forEach((items) => {
                    const customerLi = document.createElement('li');
                    customerLi.textContent = `Customer with ${items} item(s)`; 
                    customerListUl.appendChild(customerLi);
                });
            }
            laneDiv.appendChild(customerListUl);

            lanesContainer.appendChild(laneDiv);
        });
    }

    function renderLog() {
        logList.innerHTML = ''; // Clear existing log
        if (logEntries.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.classList.add('empty-log');
            emptyLi.textContent = 'No assignments yet.';
            logList.appendChild(emptyLi);
            return;
        }

        logEntries.slice().reverse().forEach(entry => { // Display newest first
            const listItem = document.createElement('li');
            
            const logTextSpan = document.createElement('span');
            logTextSpan.classList.add('log-text');
            logTextSpan.textContent = `Customer ${entry.customerLabel} (Items: ${entry.itemCount}) assigned to Lane ${entry.assignedLaneId}.`;
            
            const timestampSpan = document.createElement('span');
            timestampSpan.classList.add('timestamp');
            timestampSpan.textContent = entry.timestamp;
            
            listItem.appendChild(logTextSpan);
            listItem.appendChild(timestampSpan);
            logList.appendChild(listItem);
        });
    }

    function handleAddCustomer(e) {
        e.preventDefault();
        const itemCountString = itemCountInput.value;
        if (!itemCountString.trim()) { // Check if input is empty or only whitespace
            alert("Please enter the number of items.");
            itemCountInput.focus();
            return;
        }
        const itemCount = parseInt(itemCountString, 10);


        if (isNaN(itemCount) || itemCount <= 0) {
            alert("Please enter a valid positive number of items.");
            itemCountInput.value = '';
            itemCountInput.focus();
            return;
        }

        if (lanes.length === 0) {
            alert("System Error: No checkout lanes available.");
            return;
        }

        // Find the best lane (lane with fewest total items, then smallest ID for ties)
        let bestLaneIndex = 0;
        // Initialize minItems with the first lane's totalItemsInQueue
        // If all lanes are empty, it will remain 0, which is fine.
        let minItems = lanes[0].totalItemsInQueue; 

        for (let i = 1; i < lanes.length; i++) {
            if (lanes[i].totalItemsInQueue < minItems) {
                minItems = lanes[i].totalItemsInQueue;
                bestLaneIndex = i;
            }
        }
        
        const assignedLane = lanes[bestLaneIndex];
        assignedLane.itemsQueue.push(itemCount);
        assignedLane.totalItemsInQueue += itemCount;

        // Clear previous highlight timeout and remove class if any
        if (highlightTimeout) clearTimeout(highlightTimeout);
        if (highlightedLaneId !== null) {
            const prevHighlightedEl = document.getElementById(`lane-${highlightedLaneId}`);
            if (prevHighlightedEl) prevHighlightedEl.classList.remove('highlighted');
        }
        
        // Set new highlight
        highlightedLaneId = assignedLane.id;
       
        const newLogEntry = {
            customerLabel: `ID-${nextCustomerId}`, // Using a more distinct label
            itemCount,
            assignedLaneId: assignedLane.id,
            timestamp: new Date().toLocaleTimeString(),
        };
        logEntries.push(newLogEntry);

        nextCustomerId++;
        itemCountInput.value = ''; // Clear input
        itemCountInput.focus();

        renderLanes(); // Re-render all lanes to update visuals including new highlight
        renderLog();   // Re-render log

        // Set timeout to remove current highlight
        highlightTimeout = setTimeout(() => {
            const currentHighlightedEl = document.getElementById(`lane-${assignedLane.id}`);
            if (currentHighlightedEl) {
                currentHighlightedEl.classList.remove('highlighted');
            }
            if (highlightedLaneId === assignedLane.id) { // Only clear if it's still the one we set
                highlightedLaneId = null;
            }
            highlightTimeout = null;
        }, 1500); // Highlight duration
    }

    customerForm.addEventListener('submit', handleAddCustomer);

    // Initial setup
    initializeLanes(INITIAL_LANE_COUNT);
    itemCountInput.focus(); // Focus on input on page load
});
