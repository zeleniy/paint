/**
 * @author Zelenin Alexandr <zeleniy.spb@gmail.com>
 * @public
 * @class
 */
function StandardDiagram() {
    /*
     * Stash reference to this object.
     */
    var self = this;
    /**
     * Chart unique id.
     * @private
     * @member {String}
     */
    this._id = this._getUniqueId();
    /**
     * Chart top level container.
     * @private
     * @member {d3.selection}
     */
    this._container = undefined;
    /**
     * Image data.
     * @private
     * @member {Object}
     */
    this._image = {
        width: 4001,
        height: 2250,
        src: 'img/Diagram 1_no line-01.png',
        startPoint: [1055, 747],
        endX: 2305,
        element: d3.select()
    };
    /**
     * Pointer max x position.
     * @private
     * @member {Number}
     */
    this._xMax = 0;
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
            self._dragStartEventHandler();
        }).on('drag', function() {
            self._dragEventHandler();
        }).on('end', function() {
            self._dragEndEventHandler();
        });
    /**
     * Is user finished?
     * @private
     * @member {Boolean}
     */
    this._isFinished = false;
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
    this._imageXScale = d3.scaleLinear();
    /**
     * Image level y scale function.
     * @private
     * @member {Function}
     */
    this._imageYScale = d3.scaleLinear();
    /**
     * Chart default options.
     * @private
     * @member {Object}
     */
    this._defaults = {
        width : 400,
        height: 300
    };
    /*
     * Register window resize event handler.
     */
    d3.select(window).on('resize.' + this._id, function() {
        self._resize();
        self._update();
    });
}


/**
 * Factory method.
 * @public
 * @static
 * @param {Object} config
 * @returns {StandardDiagram}
 */
StandardDiagram.getInstance = function(config) {

    return new StandardDiagram(config);
};


/**
 * Set chart margin.
 * @public
 * @param {Object|Number} margin
 * @returns {StandardDiagram}
 */
StandardDiagram.prototype.setMargin = function(margin) {

    if (margin instanceof Object) {
        for (var i in margin) {
            this._margin[i] = margin[i];
        }
    } else {
        for (var i in this._margin) {
            this._margin[i] = margin;
        }
    }

    return this;
};


/**
 * Set up chart dimensions.
 * @private
 * @param {Object} dimension
 */
StandardDiagram.prototype._resize = function(dimension) {
    /*
     * Get chart container's dimensions.
     */
    var dimension = dimension || this._container.node().getBoundingClientRect();
    /*
     * Define outer dimensions.
     */
    this._outerWidth  = dimension.width || this._defaults.width;
    this._outerHeight = this._outerWidth * this._image.height / this._image.width;
    /*
     * Configure scale functions.
     */
    this._imageXScale.range([0, this._outerWidth]);
    this._imageYScale.range([0, this._outerHeight]);
    this._svgXScale.range([0, this._outerWidth]);
    this._svgYScale.range([0, this._outerHeight])
};


/**
 * Update chart.
 * @private
 */
StandardDiagram.prototype._update = function() {
    /*
     * Resize SVG element.
     */
    this._svg
        .attr('width', this._outerWidth)
        .attr('height', this._outerHeight);

    this._image.element
        .attr('width', this._outerWidth)
        .attr('height', this._outerHeight);

    this._start
        .attr('cx', this._imageXScale(this._image.startPoint[0]))
        .attr('cy', this._imageYScale(this._image.startPoint[1]));

    this._end
        .attr('cx', this._imageXScale(2305))
        .attr('cy', this._imageYScale(747));

    this._redrawLine();
};


/**
 * Render chart.
 * @public
 * @param {String} selection
 * @returns {StandardDiagram}
 */
StandardDiagram.prototype.renderTo = function(selection) {
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
     * Append trace path.
     */
    this._path = this._svg.append('path')
        .attr('class', 'user-path');
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
    this._image.element = this._svg.append('image')
        .attr('xlink:href', this._image.src);
    /*
     * Append start point.
     */
    this._start = this._svg.append('circle')
        .attr('class', 'start-point')
        .attr('r', 5)
        .call(this._dragHandler);
    /*
     * Append button.
     */
    this._button = this._container.append()
        .attr('class', 'btn btn-primary pull-right disabled')
        .text('Show answer');
    /*
     * Populate chart with data.
     */
    this._update(true);

    return this;
};


/**
 * Set up scale domains
 */
StandardDiagram.prototype._setUpScaleDomains = function() {
    /*
     * Configure image scale functions.
     */
    this._imageXScale.domain([0, this._image.width]);
    this._imageYScale.domain([0, this._image.height]);
    /*
     * Configure svg scale functions.
     */
    this._svgXScale.domain([0, this._outerWidth]);
    this._svgYScale.domain([0, this._outerHeight])
};


/**
 * Drag start event handler.
 * @private
 */
StandardDiagram.prototype._dragStartEventHandler = function() {
    /*
     * Reset flag.
     */
    this._isFinished = false;
    /*
     * Disable button.
     */
    this._button.classed('disabled', true);
    /*
     * Reset trace data.
     */
    this._lineData = [];
};


/**
 * Drag start event handler.
 * @private
 */
StandardDiagram.prototype._dragEndEventHandler = function() {

    if (this._isFinished === true) {
        this._button.classed('disabled', false);
    }
};


/**
 * Drag event handler.
 * @private
 */
StandardDiagram.prototype._dragEventHandler = function() {
    /*
     * Do nothing if user achieve right side.
     */
    if (this._imageXScale.invert(d3.event.x) >= this._image.endX) {
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
 * Draw line.
 * @private
 */
StandardDiagram.prototype._redrawLine = function() {

    this._path.attr('d', this._lineGenerator(this._lineData));
};


/**
 * Generate chart unique id.
 * @see http://stackoverflow.com/a/2117523/1191125
 * @pivate
 * @param {String} pattern
 * @returns {String}
 */
StandardDiagram.prototype._getUniqueId = function(pattern) {

    pattern = pattern || 'xxxxxxxxxxxxxxxx';

    return pattern.replace(/x/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};