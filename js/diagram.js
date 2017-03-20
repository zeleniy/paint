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
     * Image data.
     * @private
     * @member {Object}
     */
    this._imageData = {
        width: 4001,
        height: 2250,
        startPoint: [1055, 747]
    };
    /**
     * Image selection.
     * @private
     * @member {d3.selection}
     */
    this._image = d3.select();
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
    this._outerWidth  = dimension.width || this._defaults.width;
    this._outerHeight = this._outerWidth * this._imageData.height / this._imageData.width;
    /*
     * Configure scale functions.
     */
    this._imgXScale.range([0, this._outerWidth]);
    this._imgYScale.range([0, this._outerHeight]);
    this._svgXScale.range([0, this._outerWidth]);
    this._svgYScale.range([0, this._outerHeight])
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
        .attr('width', this._outerWidth)
        .attr('height', this._outerHeight);
    /*
     * Resize background image.
     */
    this._image
        .attr('width', this._outerWidth)
        .attr('height', this._outerHeight);
    /*
     * Move start point.
     */
    this._start
        .attr('cx', this._imgXScale(this._imageData.startPoint[0]))
        .attr('cy', this._imgYScale(this._imageData.startPoint[1]));
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
    this._image = this._svg.append('image')
        .attr('xlink:href', this._images[0]);
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
    this._button = this._container.append('button')
        .attr('class', 'btn btn-primary pull-right')
        .style('visibility', 'hidden')
        .text('Show answer')
        .on('click', function() {
            self.showAnswer();
        });
    /*
     * Populate chart with data.
     */
    this._update(true);

    return this;
};


/**
 * Show answer.
 * @public
 */
Diagram.prototype.showAnswer = function() {
    /*
     * Change background image.
     */
    this._image.attr('xlink:href', this._images[1]);
    /*
     * Set default mouse cursor and remove drag event handling from start point.
     */
    this._start
        .style('cursor', 'default')
        .on(".drag", null);
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
    this._svgXScale.domain([0, this._outerWidth]);
    this._svgYScale.domain([0, this._outerHeight])
};


/**
 * Drag start event handler.
 * @private
 */
Diagram.prototype._dragStartEventHandler = function() {
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
     * Reset trace data.
     */
    this._lineData = [{
        x: this._imgXScale(this._imageData.startPoint[0]),
        y: this._imgYScale(this._imageData.startPoint[1])
    }];
};


/**
 * Drag start event handler.
 * @private
 */
Diagram.prototype._dragEndEventHandler = function() {

    if (this._isFinished === true) {
        this._button.style('visibility', 'visible');
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