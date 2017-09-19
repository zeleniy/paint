/**
 * @author Zelenin Alexandr <zeleniy.spb@gmail.com>
 * @public
 * @class
 */
function AnimatedDiagram() {
    /*
     * Call parent class constructor.
     */
    Diagram.call(this);
    /**
     * Pointer max x coordinate.
     * @private
     * @member {Number}
     */
    this._endX = 2990;
    /**
     * Images array current index.
     * @private
     * @member {Integer}
     */
    this._index = 0;
    this._axisHeightCoef = 0.8;
    this._surfaceSize = 40;
    /**
     * Required images amount.
     * @protected
     * @member {Integer}
     */
    this._requiredImagesAmount = 3;
    /**
     *
     */
    this._sliderScale = d3.scaleLinear()
        .domain([200, 800])
        .range([2, 8])
        .clamp(true);
    /**
     *
     */
     this._fontScale = d3.scaleLinear()
         .domain([200, 800])
         .range([8, 14])
         .clamp(true);
    /*
     * Preload images.
     */
    this._preload();
}

/*
 * Inherit Diagram class.
 */
AnimatedDiagram.prototype = Object.create(Diagram.prototype);


/**
 * Factory method.
 * @public
 * @static
 * @returns {AnimatedDiagram}
 */
AnimatedDiagram.getInstance = function() {

    return new AnimatedDiagram();
};


/**
 * Get answer image URL.
 * @public
 * @override
 * @returns {String}
 */
AnimatedDiagram.prototype.getAnswerImage = function() {

    return this._imagesLinks[4];
};


AnimatedDiagram.prototype._getIconSize = function() {

    return Math.min(this._width / 8, 100);
}


AnimatedDiagram.prototype._update = function() {
    /*
     * Call parent method.
     */
    Diagram.prototype._update.call(this);

    var self = this;

    var tickProtrusion = 5;
    var axisHeight = this._height * this._axisHeightCoef;
    var handleHeight = axisHeight * 0.08;
    var axisWidth = this._sliderScale(this._width);

    var iconSize = this._getIconSize();
    this._icons
        .attr('width', iconSize)
        .attr('height', iconSize)
        .attr('x', this._width - iconSize)
        .attr('y', function(d, i) {
            if (i == 0) {
                return self._sliderScale(self._width);
            } else {
                return (self._height - axisHeight) / 2 + axisHeight - iconSize;
            }
        });

    this._axisLabels
        .attr('y', function(d, i) {
            if (i == 0) {
                return (self._height - axisHeight) / 2;
            } else {
                return (self._height - axisHeight) / 2 + axisHeight;
            }
        }).style('font-size', this._fontScale(this._width) + 'px');

    var axisOffset = this._axisLabels
        .nodes()
        .reduce(function(length, node) {
            return Math.max(length, node.getBoundingClientRect().width * 0.75);
        }, 0) + iconSize;

    this._axisLabels
        .attr('x', this._width - axisOffset + axisWidth + tickProtrusion * 2)

    this._axis
        .attr('x', this._width - axisOffset)
        .attr('y', (this._height - axisHeight) / 2)
        .attr('width', axisWidth)
        .attr('height', axisHeight);
    this._axisTicks
        .attr('x1', this._width - axisOffset - tickProtrusion)
        .attr('y1', function(d, i) {
            return ((self._height - axisHeight) / 2) + axisHeight / 3 * i;
        }).attr('x2', this._width - axisOffset + axisWidth + tickProtrusion)
        .attr('y2', function(d, i) {
            return ((self._height - axisHeight) / 2) + axisHeight / 3 * i
        });

    var handleProtrusion = 2;
    var y = this._getHandlePosition();

    this._axisHandle
        .attr('x', this._width - axisOffset - handleProtrusion)
        .attr('y', y)
        .attr('width', axisWidth + handleProtrusion * 2)
        .attr('height', handleHeight);
    this._axisHandleSurface
        .attr('x', this._width - axisOffset - this._surfaceSize / 2 + axisWidth / 2)
        .attr('y', y - (this._surfaceSize - handleHeight) / 2)
        .attr('width', this._surfaceSize)
        .attr('height', this._surfaceSize)
        .call(d3.drag()
            .subject(function(d, i, nodes) {
                var handleRect = d3.select(nodes[0]);
                return {
                    x: handleRect.attr('x'),
                    y: handleRect.attr('y')
                };
            })
            .on('drag', function() {
               self._handleDragEventHandler()
            }).on('end', function() {
               self._handleDragEndEventHandler()
            })
        );
};


AnimatedDiagram.prototype._handleDragEventHandler = function() {

    var y = Math.max(Math.min(d3.event.y, this._getHandlePosition(0)), this._getHandlePosition(3));

    var axisHeight = this._height * this._axisHeightCoef;
    var handleHeight = axisHeight * 0.08;

    this._axisHandle.attr('y', y);
    this._axisHandleSurface.attr('y', y - (this._surfaceSize - handleHeight) / 2);

    var half = (this._getHandlePosition(0) - this._getHandlePosition(1)) / 2;

    var index = d3.range(0, 4).filter(function(d, i) {
        var min = this._getHandlePosition(d + 1);
        var max = this._getHandlePosition(d);
        return y >= min + half && y <= max + half;
    }, this)[0];
    /*
     * Update global index.
     */
    this._index = index;
    /*
     * Update background image.
     */
    this._images[0].attr('xlink:href', this._imagesLinks[index]);
}


AnimatedDiagram.prototype._handleDragEndEventHandler = function() {

    var y = Math.max(Math.min(d3.event.y, this._getHandlePosition(0)), this._getHandlePosition(3));

    var index = d3.range(0, 4).filter(function(d, i) {
        return y >= this._getHandlePosition(d + 1) && y <= this._getHandlePosition(d);
    }, this)[0];

    if (index <= this._index) {
        index = this._index;
    }

    var interval = [this._getHandlePosition(index), this._getHandlePosition(index + 1)];

    var min = interval[1];
    var max = interval[0];
    var middle = min + (max - min) / 2;

    var axisHeight = this._height * this._axisHeightCoef;
    var handleHeight = axisHeight * 0.08;

    if (y > middle) {
        this._axisHandle.attr('y', max);
        this._axisHandleSurface.attr('y', max - (this._surfaceSize - handleHeight) / 2);
    } else {
        this._axisHandle.attr('y', min);
        this._axisHandleSurface.attr('y', min - (this._surfaceSize - handleHeight) / 2);
    }
    /*
     * Update global index.
     */
    this._index = index;
    /*
     * Update background image.
     */
    this._images[0].attr('xlink:href', this._imagesLinks[index]);

    if (index == this._imagesLinks.length - 3) {
        /*
         * Gradually show original image.
         */
        this._images[2]
            .style('opacity', 0)
            .attr('xlink:href', this._imagesLinks[5])
            .transition()
            .duration(1500)
            .style('opacity', 1);
        /*
         * Enable painting.
         */
        this.enablePainting();
        /*
         * Show points.
         */
        this._startPoint.classed('start-point', true);
        this._blinkPoint.classed('blink-point', true);
    } else {
        this._images[2].style('opacity', 0);
        this.disablePainting();
    }
}


/**
 * Get handle Y position based on animation frame number.
 * @public
 * @param {Integer} [index]
 * @returns {Number}
 */
AnimatedDiagram.prototype._getHandlePosition = function(index) {

    if (index == undefined) {
        index = this._index;
    }

    var axisHeight = this._height * this._axisHeightCoef;
    var handleHeight = axisHeight * 0.08;
    var top = (this._height - axisHeight) / 2 - handleHeight / 2;

    return top + (axisHeight / 3 * (3 - index));
}


/**
 * Render chart.
 * @public
 * @override
 * @param {String} selection
 * @returns {Diagram}
 */
AnimatedDiagram.prototype.renderTo = function(selection) {
    /*
     * Call parent method.
     */
    Diagram.prototype.renderTo.call(this, selection);
    /*
     * Hide points.
     */
    this._startPoint.classed('start-point', false);
    this._blinkPoint.classed('blink-point', false);
    /*
     * Render scroll.
     */
    this._scrollContainer = this._svg
        .append('g')
        .attr('class', 'scroll-container');
    this._axis = this._scrollContainer
        .append('rect')
        .attr('class', 'scroll-axis');
    this._axisTicks = this._scrollContainer
        .selectAll('line')
        .data(d3.range(0, 4))
        .enter()
        .append('line')
        .attr('class', 'scroll-axis-tick');
    this._axisHandleSurface = this._scrollContainer
        .append('rect')
        .attr('class', 'scroll-axis-handle-surface');
    this._axisHandle = this._scrollContainer
        .append('rect')
        .attr('class', 'scroll-axis-handle')
        .attr('rx', 2);
    this._axisLabels = this._scrollContainer
        .selectAll('text')
        .data(['krum', 'ikke-krum'])
        .enter()
        .append('text')
        .attr('class', 'axis-tick')
        .attr('dy', '0.3em')
        .text(String);
    this._icons = this._scrollContainer
        .selectAll('image.icon')
        .data(['img/icons/Einstein.png', 'img/icons/Newton.png'])
        .enter()
        .append('image')
        .attr('class', 'icon')
        .attr('xlink:href', String);
    /*
     * Update chart.
     */
    this._update();
};
