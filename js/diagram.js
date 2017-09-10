/**
 * @author Zelenin Alexandr <zeleniy.spb@gmail.com>
 * @public
 * @class
 */
function Diagram() {
    /*
     * Stash reference to this object.
     */
    var self = this;
    /**
     * Chart top level container.
     * @private
     * @member {d3.selection}
     */
    this._container = undefined;
    /**
     * Point radius.
     * @private
     * @member {Number}
     */
    this._pointRadius = 10;
    /**
     * Image data.
     * @private
     * @member {Object}
     */
    this._imageData = {
        width: 4001,
        height: 2250
    };
    /**
     * Main image selection.
     * @private
     * @member {d3.selection[]}
     */
    this._images = [];
    /**
     * Start point.
     * @private
     * @member {d3.selection}
     */
    this._startPoint = d3.select();
    /**
     * Points data.
     * @private
     * @member {Number[]}
     */
    this._startPointData = [1055, 747];
    /**
     * Pointer max x position.
     * @private
     * @member {Number}
     */
    this._xMax = 0;
    /**
     * Pointer max y position.
     * @private
     * @member {Number}
     */
    this._yMax = 0;
    /**
     * Trace data set.
     * @private
     * @member {Object[]}
     */
    this._lineData = [];
    /**
     * Trace generator.
     * @private
     * @member {Function}
     */
    this._lineGenerator = d3.line()
        .x(function(d) {
            return self._getAbsoluteX(d.x);
        }).y(function(d) {
            return self._getAbsoluteY(d.y);
        });
    /**
     * Drag event handler.
     * @private
     * @member {Function}
     */
    this._dragHandler = d3.drag()
        .on('start', function() {
            self._dragStartEventHandler(this);
        }).on('drag', function() {
            self._dragEventHandler(this);
        }).on('end', function() {
            self._dragEndEventHandler(this);
        });
    /**
     * Is user finished?
     * @private
     * @member {Boolean}
     */
    this._isFinished = false;
    /**
     * Required images amount.
     * By default equals to 2 - one for main and one for answer.
     * @protected
     * @member {Integer}
     */
    this._requiredImagesAmount = 2;
    /**
     * Image level x scale function.
     * @private
     * @member {Function}
     */
    this._imgXScale = d3.scaleLinear();
    /**
     * Image level y scale function.
     * @private
     * @member {Function}
     */
    this._imgYScale = d3.scaleLinear();
    /**
     * Chart default options.
     * @private
     * @member {Object}
     */
    this._defaults = {
        width : 400,
        height: 300
    };
    /**
     * Pointer max x coordinate.
     * @protected
     * @member {Number}
     */
    this._endX = 2305;
    /**
     * Pointer min y coordinate.
     * @protected
     * @member {Number}
     */
    this._topY = 150;
    /**
     * Pointer max y coordinate.
     * @protected
     * @member {Number}
     */
    this._bottomY = 2005;
    /*
     * Register window resize event handler.
     */
    d3.select(window).on('resize.' + this._getUniqueId(), function() {
        self._resize();
        self._update();
    });
}


/**
 * Factory method.
 * @public
 * @static
 * @param {Object} config
 * @returns {Diagram}
 */
Diagram.getInstance = function(config) {

    return new Diagram(config);
};


/**
 * Preload all images.
 * @protected
 */
Diagram.prototype._preload = function() {
    /*
     *
     */
    this._imagesLinks.forEach(function(url) {
        var image = new Image();
        image.src = url;
    })
};


/**
 * Set up chart dimensions.
 * @private
 * @param {Object} dimension
 */
Diagram.prototype._resize = function(dimension) {
    /*
     * Get chart container's dimensions.
     */
    var dimension = dimension || this._container.node().getBoundingClientRect();
    /*
     * Define outer dimensions.
     */
    this._width  = dimension.width || this._defaults.width;
    this._height = this._width * this._imageData.height / this._imageData.width;
    /*
     * Configure scale functions.
     */
    this._imgXScale.range([0, this._width]);
    this._imgYScale.range([0, this._height]);
};


/**
 * Update chart.
 * @protected
 */
Diagram.prototype._update = function() {
    /*
     * Resize SVG element.
     */
    this._svg
        .attr('width', this._width)
        .attr('height', this._height);
    /*
     * Resize background image.
     */
    this._images.forEach(function(image) {
        image
            .attr('width', this._width)
            .attr('height', this._height);
    }, this);
    /*
     * Redraw line.
     */
    this._redrawLine();
};


/**
 * Render chart.
 * @public
 * @param {String} selection
 * @returns {Diagram}
 */
Diagram.prototype.renderTo = function(selection) {
    /*
     * Stash reference to this object.
     */
    var self = this;
    /*
     * Select chart container.
     */
    this._container = d3.select(selection)
        .attr('class', 'paint-diagram');
    /*
     * Append SVG element.
     */
    this._svg = this._container.append('svg')
        .attr('class', 'paint');
    /*
     * Set up chart dimensions.
     */
    this._resize();
    /*
     * Set scale domains.
     */
    this._setUpScaleDomains();
    /*
     * Append background image.
     */
    for (var i = 0; i < this._requiredImagesAmount; i ++) {
        var image = this._svg.append('image');

        if (i == 0) {
            image.attr('xlink:href', this._imagesLinks[0]);
        }

        this._images.push(image);
    }
    /*
     * Append trace path.
     */
    this._path = this._svg.append('path')
        .attr('class', 'user-path');
    /*
     * Append start points.
     */
    this._startPoint = this._svg
        .append('circle')
        .datum(this._startPointData)
        .attr('class', 'point start-point')
        .attr('r', this._pointRadius);
    /*
     * Append blink point.
     */
    this._blinkPoint = this._svg
        .append('circle')
        .datum(this._startPointData)
        .attr('class', 'point blink-point')
        .attr('r', this._pointRadius);
    /*
     * Append buttons.
     */
    this._showAnswerButton = this._container.append('button')
        .attr('class', 'btn btn-primary pull-right')
        .style('visibility', 'hidden')
        .text('vis svar')
        .on('click', function() {
            self.showAnswer();
        });

    this._resetButton = this._container.append('button')
        .attr('class', 'btn btn-primary pull-right')
        .style('visibility', 'hidden')
        .text('tilbakestill')
        .on('click', function() {
            self.reset();
        });

    return this;
};


/**
 * Enable paint mode.
 * @public
 */
Diagram.prototype.enablePainting = function() {
    /*
     * Append start point.
     */
    this._startPoint.call(this._dragHandler);
    /*
     * Set default mouse cursor and remove drag event handling from start point.
     */
    this._startPoint.style('cursor', 'pointer');
    /*
     * Enable blinking.
     */
    this._blinkPoint.classed('blink-point', true);
};


/**
 * Disable paint mode.
 * @public
 */
Diagram.prototype.disablePainting = function() {
    /*
     * Set default mouse cursor and remove drag event handling from start point.
     */
    this._startPoint.style('cursor', 'default')
        .on('.drag', null);
};


/**
 * Get answer image URL.
 * @abstarct
 * @public
 * @returns {String}
 */
Diagram.prototype.getAnswerImage = function() {

    throw new Error('#getAnswerImage method not implemented');
};


/**
 * Show button.
 * @public
 */
Diagram.prototype.showAnswerButton = function() {
    /*
     * Change buttons CSS "visibility" property.
     */
    this._showAnswerButton.style('visibility', 'visible');
    this._resetButton.style('visibility', 'visible');
};


/**
 * Show button.
 * @public
 */
Diagram.prototype.showAnswer = function() {
    /*
     * Change background image.
     */
    this._images[1].attr('xlink:href', this.getAnswerImage());
    /*
     * Set default mouse cursor and remove drag event handling from start point.
     */
    this.disablePainting();
};


/**
 * Reset diagram.
 * @public
 */
Diagram.prototype.reset = function() {
    /*
     * Reset max values.
     */
    this._xMax = 0;
    this._yMax = 0;
    /*
     * Disable button.
     */
    this._showAnswerButton.style('visibility', 'hidden');
    this._resetButton.style('visibility', 'hidden');
    /*
     * Reset trace data.
     */
    this._lineData = [{
        x: this._getRelativeX(this._imgXScale(this._startPointData[0])),
        y: this._getRelativeY(this._imgYScale(this._startPointData[1]))
    }];
    /*
     * Redraw line based on empty data.
     */
    this._redrawLine();
    /*
     * Remove answer background image.
     */
    this._images[1].attr('xlink:href', null);
    /*
     * Enable painting if was disabled.
     */
    this.enablePainting();
};


/**
 * Set up scale domains
 */
Diagram.prototype._setUpScaleDomains = function() {
    /*
     * Configure image scale functions.
     */
    this._imgXScale.domain([0, this._imageData.width]);
    this._imgYScale.domain([0, this._imageData.height]);
};


/**
 * Drag start event handler.
 * @protected
 */
Diagram.prototype._dragStartEventHandler = function() {
    /*
     * Reset flag.
     */
    this._isFinished = false;
    // /*
    //  * Show reset button.
    //  */
    // this._resetButton.style('visibility', 'visible');
    /*
     * Disable blinking.
     */
    this._blinkPoint.classed('blink-point', false);
};


/**
 * Drag event handler.
 * @protected
 * @param {SVGElement} sourcePoint
 */
Diagram.prototype._dragEventHandler = function(sourcePoint) {
    /*
     * Show button and quite if target achieved.
     */
    if (this._isFinished === true) {
        return this.showAnswerButton();
    }
    /*
     * Check border "violence". If user crossed border - stop painting.
     */
    if (this._isTargetAchieved()) {
        return this._isFinished = true;
    }
    /*
     * Update only y coordinate if user try to draw in opposite direction.
     */
    if (this._xMax >= this._getRelativeX(d3.event.x) && this._lineData.length) {
        this._lineData[this._lineData.length - 1].y = this._getRelativeY(d3.event.y);
        return this._redrawLine();
    }
    /*
     * Update rightmost position where user was.
     */
    this._xMax = this._getRelativeX(d3.event.x);
    /*
     * Add new point to the line data set.
     */
    this._lineData.push({
        x : this._getRelativeX(d3.event.x),
        y : this._getRelativeY(d3.event.y)
    });
    /*
     * Redraw line.
     */
    this._redrawLine();
};


/**
 * Is target achieved?
 * Method checks if user achieve final pointer position.
 * @private
 * @returns {Boolean}
 */
Diagram.prototype._isTargetAchieved = function() {

    return this._imgXScale.invert(d3.event.x) >= this._endX ||
        this._imgYScale.invert(d3.event.y) >= this._bottomY ||
        this._imgYScale.invert(d3.event.y) <= this._topY;
};


/**
 * Drag end event handler.
 * @protected
 */
Diagram.prototype._dragEndEventHandler = function() {

    // if (this._isFinished === true) {
        this.showAnswerButton();
    // }
};


/**
 * Draw line.
 * @private
 */
Diagram.prototype._redrawLine = function() {

    this._path.attr('d', this._lineGenerator(this._lineData));
    /*
     * Get cursor position and move start point.
     */
    var position = this._lineData[this._lineData.length - 1] || {
        x: this._getRelativeX(this._imgXScale(this._startPointData[0])),
        y: this._getRelativeY(this._imgYScale(this._startPointData[1]))
    };

    var self = this;
    this._startPoint
        .datum([position.x, position.y])
        .attr('cx', function(d) {
            return self._getAbsoluteX(d[0]);
        }).attr('cy', function(d) {
            return self._getAbsoluteY(d[1]);
        });

    this._blinkPoint
        .attr('cx', function(d) {
            return self._imgXScale(d[0]);
        }).attr('cy', function(d) {
            return self._imgYScale(d[1]);
        });
};


/**
 * Convert pointer (absolute) x coordinate to relative.
 * @param {Number} x
 * @returns {Number}
 */
Diagram.prototype._getRelativeX = function(x) {

    return x / this._width;
};


/**
 * Convert pointer (absolute) y coordinate to relative.
 * @param {Number} y
 * @returns {Number}
 */
Diagram.prototype._getRelativeY = function(y) {

    return y / this._height;
};


/**
 * Convert relative x coordinate to absolute.
 * @param {Number} x
 * @returns {Number}
 */
Diagram.prototype._getAbsoluteX = function(x) {

    return x * this._width;
};


/**
 * Convert relative y coordinate to absolute.
 * @param {Number} y
 * @returns {Number}
 */
Diagram.prototype._getAbsoluteY = function(y) {

    return y * this._height;
};


/**
 * Generate chart unique id.
 * @see http://stackoverflow.com/a/2117523/1191125
 * @private
 * @param {String} [pattern]
 * @returns {String}
 */
Diagram.prototype._getUniqueId = function(pattern) {

    pattern = pattern || 'xxxxxxxxxxxxxxxx';

    return pattern.replace(/x/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};
