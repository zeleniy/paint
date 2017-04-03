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
    this._pointRadius = 5;
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
     * Points data.
     * @private
     * @member {Number[][]}
     */
    this._pointsData = [
        [1055, 747]
    ];
    /**
     * Points.
     * @private
     * @member {Object[]}
     */
    this._points = {
        start: [],
        end: []
    };
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
        .x(d => this._svgXScale(d.x))
        .y(d => this._svgYScale(d.y));
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
     * SVG level x scale function.
     * @private
     * @member {Function}
     */
    this._svgXScale = d3.scaleLinear();
    /**
     * SVG level y scale function.
     * @private
     * @member {Function}
     */
    this._svgYScale = d3.scaleLinear();
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
    this._svgXScale.range([0, this._width]);
    this._svgYScale.range([0, this._height])
};


/**
 * Update chart.
 * @private
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
     * Move points.
     */
    this._points.forEach(function(point, i) {
        point
            .attr('cx', d => this._imgXScale(d[0]))
            .attr('cy', d => this._imgYScale(d[1]))
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
    this._container = d3.select(selection);
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
    this._points = this._pointsData.map(function(point) {
        return this._svg.append('circle')
            .datum(point)
            .attr('class', 'point start-point')
            .attr('r', this._pointRadius);
    }, this);
    /*
     * Append button.
     */
    this._button = this._container.append('button')
        .attr('class', 'btn btn-primary pull-right')
        .style('visibility', 'hidden')
        .text('Show answer')
        .on('click', function() {
            self.showAnswer();
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
    this._points.forEach(this._dragHandler);
    /*
     * Set default mouse cursor and remove drag event handling from start point.
     */
    this._points.forEach(function(point) {
        point.style('cursor', 'pointer');
    })
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
Diagram.prototype.showButton = function() {
    /*
     * Change button CSS "visibility" property.
     */
    this._button.style('visibility', 'visible');
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
    this._points.forEach(function(point) {
        point.style('cursor', 'default')
            .on(".drag", null);
    })
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
    /*
     * Configure svg scale functions.
     */
    this._svgXScale.domain([0, this._width]);
    this._svgYScale.domain([0, this._height])
};


/**
 * Drag start event handler.
 * @protected
 * @param {SVGElement}
 */
Diagram.prototype._dragStartEventHandler = function(circle) {
    /*
     * Reset flag.
     */
    this._isFinished = false;
    /*
     * Reset max values.
     */
    this._xMax = 0;
    this._yMax = 0;
    /*
     * Disable button.
     */
    this._button.style('visibility', 'hidden');
    /*
     * Get point data.
     */
    var data = d3.select(circle).data()[0];
    /*
     * Reset trace data.
     */
    this._lineData = [{
        x: this._imgXScale(data[0]),
        y: this._imgYScale(data[1])
    }];
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
        return this.showButton();
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
    if (this._xMax >= d3.event.x && this._lineData.length) {
        this._lineData[this._lineData.length - 1].y = d3.event.y;
        return this._redrawLine();
    }
    /*
     * Update rightmost position where user was.
     */
    this._xMax = d3.event.x;
    /*
     * Add new point to the line data set.
     */
    this._lineData.push({
        x : d3.event.x,
        y : d3.event.y
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
 * Drag start event handler.
 * @protected
 */
Diagram.prototype._dragEndEventHandler = function() {

    if (this._isFinished === true) {
        this.showButton();
    }
};


/**
 * Draw line.
 * @private
 */
Diagram.prototype._redrawLine = function() {

    this._path.attr('d', this._lineGenerator(this._lineData));
};


/**
 * Generate chart unique id.
 * @see http://stackoverflow.com/a/2117523/1191125
 * @pivate
 * @param {String} pattern
 * @returns {String}
 */
Diagram.prototype._getUniqueId = function(pattern) {

    pattern = pattern || 'xxxxxxxxxxxxxxxx';

    return pattern.replace(/x/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};