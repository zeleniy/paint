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
    /**
     * Scrolling/animation step.
     * @private
     * @member {Integer}
     */
    this._step = 80;
    this._frameNumber = 0;
    /**
     * Virtual y offset.
     * @private
     * @member {Integer}
     */
    this._yOffset = 0;
    /**
     * Required images amount.
     * @protected
     * @member {Integer}
     */
    this._requiredImagesAmount = 3;
    /*
     *
     */
    this._sliderScale = d3.scaleLinear()
        .domain([200, 800])
        .range([2, 8])
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


AnimatedDiagram.prototype._update = function() {
    /*
     * Call parent method.
     */
    Diagram.prototype._update.call(this);
    // console.log(this._frameNumber)
    // /*
    //  * Resize scroll icon.
    //  */
    // var offset = 50;
    // this._scrollBackground
    //     .attr('x', this._width - 120 - offset)
    //     .attr('y', this._height - 120 - offset)
    //     .attr('width', 120)
    //     .attr('height', 120);
    // this._scroll
    //     .attr('x', this._width - 80 - offset)
    //     .attr('y', this._height - 95 - offset)
    //     .attr('width', 40)
    //     .attr('height', 70);
    // this._scrollPointer
    //     .attr('cx', this._width - 60 - offset)
    //     .attr('cy', this._height - 85 - offset);
    // this._scrollText
    //     .attr('x', this._width - 60 - offset)
    //     .attr('y', this._height - 135 - offset);

    const tickProtrusion = 5;
    const handleProtrusion = 2;
    const axisHeight = this._height * 0.85;
    const handleHeight = axisHeight * 0.08;

    this._axis
        .attr('x', this._width - 50)
        .attr('y', (this._height - axisHeight) / 2)
        .attr('width', this._sliderScale(this._width))
        .attr('height', axisHeight);
    this._axisTicks
        .attr('x1', this._width - 50 - tickProtrusion)
        .attr('y1', (d, i) => ((this._height - axisHeight) / 2) + axisHeight / 3 * i)
        .attr('x2', this._width - 50 + this._sliderScale(this._width) + tickProtrusion)
        .attr('y2', (d, i) => ((this._height - axisHeight) / 2) + axisHeight / 3 * i);
    this._axisHandle
        .attr('x', this._width - 50 - handleProtrusion)
        .attr('y', this._getHandlePosition())
        .attr('width', this._sliderScale(this._width) + handleProtrusion * 2)
        .attr('height', handleHeight)
        .call(d3.drag()
            .subject(function(d, i, nodes) {
                var handleRect = d3.select(nodes[0]);
                return {
                    x: handleRect.attr('x'),
                    y: handleRect.attr('y')
                };
            }).on('drag', function() {
               this._handleDragEventHandler()
            }.bind(this))
            .on('end', function() {
               this._handleDragEndEventHandler()
            }.bind(this))
        );
};


AnimatedDiagram.prototype._handleDragEventHandler = function() {

    this._axisHandle
        .attr('y', Math.max(Math.min(d3.event.y, this._getHandlePosition(0)), this._getHandlePosition(3)));
}


AnimatedDiagram.prototype._handleDragEndEventHandler = function() {

    var y = d3.event.y;

    var index = d3.range(0, 3).filter(function(d, i) {

            var min = this._getHandlePosition(d + 1);
            var max = this._getHandlePosition(d);

            if (i == 0) {
                return y >= min && y < max;
            } else if (i == 2) {
                return y >= min && y < max;
            } else {
                return y >= min && y <= max;
            }
        }, this)[0];

    var interval = [this._getHandlePosition(index), this._getHandlePosition(index + 1)];

    var min = interval[1];
    var max = interval[0];
    var middle = min + (max - min) / 2;

    if (y > middle) {
        this._axisHandle.attr('y', max);
    } else {
        this._axisHandle.attr('y', min);
        index ++;
    }

    this._frameNumber = index;
}


/**
 * Get handle Y position based on animation frame number.
 * @public
 * @returns {Number}
 */
AnimatedDiagram.prototype._getHandlePosition = function(frameNumber) {

    if (frameNumber == undefined) {
        frameNumber = this._frameNumber;
    }

    const axisHeight = this._height * 0.85;
    const handleHeight = axisHeight * 0.08;
    const top = (this._height - axisHeight) / 2 - handleHeight / 2;

    return top + (axisHeight / 3 * (3 - frameNumber));
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
     * Render scroll.
     */
    this._scrollContainer = this._svg
        .append('g')
        .attr('class', 'scroll-container')
        .style('opacity', 1);
    this._axis = this._scrollContainer
        .append('rect')
        .attr('class', 'scroll-axis');
    this._axisTicks = this._scrollContainer
        .selectAll('line')
        .data(d3.range(0, 4))
        .enter()
        .append('line')
        .attr('class', 'scroll-axis-tick');
    this._axisHandle = this._scrollContainer
        .append('rect')
        .attr('class', 'scroll-axis-handle')
        .attr('rx', 2);



    // this._scrollBackground = this._scrollContainer.append('rect')
    //     .attr('class', 'scroll-background')
    //     .attr('x', this._width - 150 - 10)
    //     .attr('y', this._height - 150 - 10)
    //     .attr('width', 150)
    //     .attr('height', 150)
    //     .style('fill', '#3498db');
    // this._scroll = this._scrollContainer.append('rect')
    //     .attr('class', 'scroll')
    //     .attr('x', this._width - 95 - 10)
    //     .attr('y', this._height - 110 - 10)
    //     .attr('width', 40)
    //     .attr('height', 70)
    //     .attr('ry', 20)
    //     .style('fill', '#3498db')
    //     .style('stroke', '#fff')
    //     .style('stroke-width', 1);
    // this._scrollPointer = this._scrollContainer.append('circle')
    //     .attr('class', 'scroll-pointer')
    //     .attr('cx', this._width - 75 - 10)
    //     .attr('cy', this._height - 100 - 10)
    //     .attr('r', 5)
    //     .style('fill', '#fff');
    // this._scrollText = this._scrollContainer.append('text')
    //     .attr('class', 'scroll-text')
    //     .text('"SCROLL" FOR Å BØYE TIDROM');
    // /*
    //  * Stash reference to this object.
    //  */
    // var self = this;
    // /*
    //  * Set scroll event handler.
    //  */
    // this._svg.on('wheel', function() {
    //     /*
    //      * Prevent mousewheel event default behaviour. Necessary because of Safari bug.
    //      * See for details:
    //      * - https://github.com/jquery/jquery-mousewheel
    //      * - https://github.com/jquery/jquery-mousewheel/issues/156#issuecomment-185433754
    //      * - https://bugs.webkit.org/show_bug.cgi?id=149526
    //      */
    //     d3.event.preventDefault();
    //     /*
    //      * Calculate y offset. It should be restricted between 0 and 'step * size(this._imagesLinks)'
    //      */
    //     self._yOffset = Math.min(self._step * (self._imagesLinks.length - 3), Math.max(0, self._yOffset + d3.event.deltaY));
    //     /*
    //      * Calculate images array index.
    //      */
    //     var index = Math.max(0, Math.min(self._imagesLinks.length - 3, Math.round((self._yOffset / self._step))));
    //     /*
    //      * Check local and global indexes equality.
    //      */
    //     if (self._index < index) {
    //         /*
    //          * Update global index.
    //          */
    //         self._index = index;
    //         /*
    //          * Update background image.
    //          */
    //         self._images[0].attr('xlink:href', self._imagesLinks[index]);
    //         if (index == self._imagesLinks.length - 3) {
    //             /*
    //              * Gradually show original image.
    //              */
    //             self._images[2]
    //                 .style('opacity', 0)
    //                 .attr('xlink:href', self._imagesLinks[5])
    //                 .transition()
    //                 .duration(1500)
    //                 .style('opacity', 1);
    //             /*
    //              * Also gradually hide and then remove scroll icon.
    //              */
    //             self._scrollContainer
    //                 .transition()
    //                 .duration(1500)
    //                 .style('opacity', 0)
    //                 .remove();
    //             /*
    //              * Enable painting.
    //              */
    //             self.enablePainting();
    //         }
    //     }
    // });
    /*
     * Populate chart with data.
     */
    this._update(true);
};
