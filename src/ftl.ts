/**
 * This section is FTjs from ftl.rocks, another Airgap project.
 * GitHub: https://github.com/airgap/ftl
 */
export const ftl = () => {
    // The element currently anticipated to be hovered over
    let _prehoveredElement: Element,
        // The cursor's last position, defaults to 0,0
        _lastPos = {
            'x': 0,
            'y': 0
        },
        // The cursor's current location, defaults to 0,0
        _cursorPos = {
            'x': 0,
            'y': 0
        },

        // Minification helpers
        _Math = Math,
        _pow = _Math.pow,
        _document = document,
        _parentNode = 'parentNode',
        _classList = 'classList',
        _prehoverClass = 'prehover',

        // Ensure -200 <= value <= 200
        _lock200 = _value => _Math.min(200, _Math.max(-200, _value)),

        // Create an event of [type] with [detail] and dispatch it on [element]
        _dispatchEventOnElement = (_element, _type, _detail?) =>
            _element.dispatchEvent(new CustomEvent(_type, {
                'detail': _detail
            })),

        // Analyze a prediction and trigger appropriate events on the predicted element
        _analyzePrediction = (_prediction: {
            x: number, // X location
            y: number, // Y location
            d: number // Inverse confidence of prediction (lower is better)
        }) => {

            // Get the element at the foreseen position
            let _elementAtPoint = _document.elementFromPoint(_prediction.x, _prediction.y),

                // The ancestors of the foreseen element
                _prehoveredAncestors = [],

                // The ancestors of the last forseen element
                _lastAncestors = [],

                // The element each portion of this method is currently focusing on
                // Starts as the last foreseen element
                _currentElement = _prehoveredElement;

            // if (the last foreseen element exists) and either
            // ((the new foreseen element doesn't exist) or (is equal to the last foreseen element))
            if (_prehoveredElement && (!_elementAtPoint || _elementAtPoint !== _prehoveredElement)) {

                // Remove the last foreseen element's 'prehover' class
                _prehoveredElement[_classList].remove(_prehoverClass);

                // Dispatch an event on the element saying it is no longer foreseen as being hovered over
                _dispatchEventOnElement(_prehoveredElement, "erphover")
            }

            // if (the new foreseen element exists) and is not equal to the last foreseen element
            if (_elementAtPoint && _prehoveredElement !== _elementAtPoint) {

                // Push each ancestor of the last foreseen element to an array
                while (_currentElement) _lastAncestors.push(_currentElement = _currentElement[_parentNode]);

                // Now focus on the new foreseen element
                _currentElement = _elementAtPoint;

                // Push each ancestor of the new foreseen element to an array
                while (_currentElement) _prehoveredAncestors.push(_currentElement = _currentElement[_parentNode]);

                // Iterate over each of the old foreseen element's ancestors
                for (_currentElement of _lastAncestors) {

                    // If the element exists and is not also an ancestor of the new prehovered element...
                    if (_currentElement && _prehoveredAncestors.indexOf(_currentElement) < 0) {

                        // ...remove its 'prehover' class
                        _currentElement[_classList].remove(_prehoverClass)
                    }
                }

                // Iterate over each of the new foreseen element's ancestors
                for (_currentElement of _prehoveredAncestors) {

                    // If the element exists and is not a member of the old element's ancestors...
                    if (_currentElement && _currentElement[_classList] && _lastAncestors.indexOf(_currentElement) < 0) {

                        // ...give it the 'prehover' class
                        _currentElement[_classList].add(_prehoverClass)
                    }
                }

                // Give the new foreseen element itself the 'prehover' class
                _elementAtPoint[_classList].add(_prehoverClass);

                // Dispatch the 'prehover' event on the new foreseen element,
                // including the confidence level as the detail
                _dispatchEventOnElement(_elementAtPoint, _prehoverClass, {
                    'd': _prediction.d
                });

                // Store the new foreseen element for future use (it is now the 'last' foreseen element)
                _prehoveredElement = _elementAtPoint
            }
        },

        // Generate a predicted hover location based on the mouse's current and last positions
        _generatePrediction = () => {
            const

                // Subtract the old X and Y coords from the new X and Y coords and multiply the result by 4
                // to get the relative position of the foreseen location from the current cursor location
                _delta = {
                    'x': _lock200((_cursorPos.x - _lastPos.x) * 4),
                    'y': _lock200((_cursorPos.y - _lastPos.y) * 4)
                },

                // Add the relative foreseen location to the current absolute location to get the absolute
                // foreseen mouse location
                _predictedPos = {
                    'x': _cursorPos.x + _delta.x, // X location
                    'y': _cursorPos.y + _delta.y, // Y location
                    'd': _pow(_pow(_delta.x, 2) + _pow(_delta.y, 2), .5) // Inverse confidence
                };

            // Dispatch the 'precursormove' event on the document, including the x, y, and confidence values
            _dispatchEventOnElement(_document, "precursormove", {
                'x': _predictedPos.x,
                'y': _predictedPos.y,
                'd': _predictedPos.d
            });

            // Analyze the prediction to trigger the appropriate 'prehover' and 'erphover' events and assign
            // the 'prehover' class to the appropriate elements
            _analyzePrediction(_predictedPos);

            // Store the current mouse location for later use (it is now the 'last' location)
            _lastPos = _cursorPos
        },

        // Handle mousemove events on an element (here it's the document)
        _processMouseMove = _event => {

            // Update the current mouse location
            _cursorPos = {
                'x': _event.clientX,
                'y': _event.clientY
            };

            // Generate a prediction based on the current mouse location
            _generatePrediction()
        };

    //Bind that event handler to the document's 'mousemove' event
    _document.addEventListener("mousemove", _processMouseMove)
};
