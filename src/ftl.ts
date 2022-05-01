/**
 * This section is FTjs from ftl.rocks, another Airgap project.
 * GitHub: https://github.com/airgap/ftl
 */
export const ftl = () => {
	// The element currently anticipated to be hovered over
	let prehoveredElement: Element;
	// The cursor's last position, defaults to 0,0
	let lastPos = {
		x: 0,
		y: 0,
	};
	// The cursor's current location, defaults to 0,0
	let cursorPos = {
		x: 0,
		y: 0,
	};
	// Minification helpers
	const prehoverClass = 'prehover';
	// Ensure -200 <= value <= 200
	const lock200 = (value: number) => Math.min(200, Math.max(-200, value));
	// Create an event of [type] with [detail] and dispatch it on [element]
	const dispatchEventOnNode = (node: Node, type: string, detail?: any) =>
		node.dispatchEvent(
			new CustomEvent(type, {
				detail,
			})
		);
	// Analyze a prediction and trigger appropriate events on the predicted element
	const analyzePrediction = (prediction: {
		x: number; // X location
		y: number; // Y location
		d: number; // Inverse confidence of prediction (lower is better)
	}) => {
		// Get the element at the foreseen position
		const elementAtPoint = document.elementFromPoint(
			prediction.x,
			prediction.y
		);
		// The ancestors of the foreseen element
		const prehoveredAncestors = [];
		// The ancestors of the last forseen element
		const lastAncestors = [];
		// The element each portion of this method is currently focusing on
		// Starts as the last foreseen element
		let currentNode: Element | ParentNode | null = prehoveredElement;

		// If (the last foreseen element exists) and either
		// ((the new foreseen element doesn't exist) or (is equal to the last foreseen element))
		if (
			prehoveredElement &&
			(!elementAtPoint || elementAtPoint !== prehoveredElement)
		) {
			// Remove the last foreseen element's 'prehover' class
			prehoveredElement.classList.remove(prehoverClass);

			// Dispatch an event on the element saying it is no longer foreseen as being hovered over
			dispatchEventOnNode(prehoveredElement, 'erphover');
		}

		// If (the new foreseen element exists) and is not equal to the last foreseen element
		if (elementAtPoint && prehoveredElement !== elementAtPoint) {
			// Push each ancestor of the last foreseen element to an array
			while (currentNode)
				lastAncestors.push((currentNode = currentNode.parentNode));

			// Now focus on the new foreseen element
			currentNode = elementAtPoint;

			// Push each ancestor of the new foreseen element to an array
			while (currentNode)
				prehoveredAncestors.push(
					(currentNode = currentNode.parentNode)
				);

			// Iterate over each of the old foreseen element's ancestors
			for (currentNode of lastAncestors) {
				// If the element exists and is not also an ancestor of the new prehovered element...
				if (
					currentNode &&
					!prehoveredAncestors.includes(currentNode) &&
					currentNode instanceof Element
				) {
					// ...remove its 'prehover' class
					currentNode.classList.remove(prehoverClass);
				}
			}

			// Iterate over each of the new foreseen element's ancestors
			for (currentNode of prehoveredAncestors) {
				// If the element exists and is not a member of the old element's ancestors...
				if (
					currentNode &&
					currentNode instanceof Element &&
					!lastAncestors.includes(currentNode)
				) {
					// ...give it the 'prehover' class
					currentNode.classList.add(prehoverClass);
				}
			}

			// Give the new foreseen element itself the 'prehover' class
			elementAtPoint.classList.add(prehoverClass);

			// Dispatch the 'prehover' event on the new foreseen element,
			// including the confidence level as the detail
			dispatchEventOnNode(elementAtPoint, prehoverClass, {
				d: prediction.d,
			});

			// Store the new foreseen element for future use (it is now the 'last' foreseen element)
			prehoveredElement = elementAtPoint;
		}
	};

	// Generate a predicted hover location based on the mouse's current and last positions
	const generatePrediction = () => {
		const // Subtract the old X and Y coords from the new X and Y coords and multiply the result by 4
			// to get the relative position of the foreseen location from the current cursor location
			delta = {
				x: lock200((cursorPos.x - lastPos.x) * 4),
				y: lock200((cursorPos.y - lastPos.y) * 4),
			};
		// Add the relative foreseen location to the current absolute location to get the absolute
		// foreseen mouse location
		const predictedPos = {
			x: cursorPos.x + delta.x, // X location
			y: cursorPos.y + delta.y, // Y location
			d: (delta.x ** 2 + delta.y ** 2) ** 0.5, // Inverse confidence
		};

		// Dispatch the 'precursormove' event on the document, including the x, y, and confidence values
		dispatchEventOnNode(document, 'precursormove', {
			x: predictedPos.x,
			y: predictedPos.y,
			d: predictedPos.d,
		});

		// Analyze the prediction to trigger the appropriate 'prehover' and 'erphover' events and assign
		// the 'prehover' class to the appropriate elements
		analyzePrediction(predictedPos);

		// Store the current mouse location for later use (it is now the 'last' location)
		lastPos = cursorPos;
	};

	// Handle mousemove events on an element (here it's the document)
	const processMouseMove = (event: MouseEvent) => {
		// Update the current mouse location
		cursorPos = {
			x: event.clientX,
			y: event.clientY,
		};

		// Generate a prediction based on the current mouse location
		generatePrediction();
	};

	// Bind that event handler to the document's 'mousemove' event
	document.addEventListener('mousemove', processMouseMove);
};
