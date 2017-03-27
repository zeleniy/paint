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
     * Images urls.
     * @private
     * @member {String}
     */
    this._imagesLinks = [
        'img2/Diagram 1_no line.png',
        'img2/Warped diagram 1.png',
        'img2/Warped diagram 2.png',
        'img2/Warped diagram 3.png',
        'img2/Correct line 1_Warped diagram.png',
        'img2/Faded straigth diagram-01.png'
    ];
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
 * @param {Object} config
 * @returns {AnimatedDiagram}
 */
AnimatedDiagram.getInstance = function(config) {

    return new AnimatedDiagram(config);
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
    /*
     * Resize scroll icon.
     */
    var offset = 50;
    this._scrollBackground
        .attr('x', this._width - 120 - offset)
        .attr('y', this._height - 120 - offset)
        .attr('width', 120)
        .attr('height', 120);
    this._scroll
        .attr('x', this._width - 80 - offset)
        .attr('y', this._height - 95 - offset)
        .attr('width', 40)
        .attr('height', 70);
    this._scrollPointer
        .attr('cx', this._width - 60 - offset)
        .attr('cy', this._height - 85 - offset);
    this._scrollText
        .attr('x', this._width - 60 - offset)
        .attr('y', this._height - 135 - offset);
};


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
    this._scrollContainer = this._svg.append('g')
        .attr('class', 'scroll-container')
        .style('opacity', 1);
    this._scrollBackground = this._scrollContainer.append('rect')
        .attr('class', 'scroll-background')
        .attr('x', this._width - 150 - 10)
        .attr('y', this._height - 150 - 10)
        .attr('width', 150)
        .attr('height', 150)
        .style('fill', '#3498db');
    this._scroll = this._scrollContainer.append('rect')
        .attr('class', 'scroll')
        .attr('x', this._width - 95 - 10)
        .attr('y', this._height - 110 - 10)
        .attr('width', 40)
        .attr('height', 70)
        .attr('ry', 20)
        .style('fill', '#3498db')
        .style('stroke', '#fff')
        .style('stroke-width', 1);
    this._scrollPointer = this._scrollContainer.append('circle')
        .attr('class', 'scroll-pointer')
        .attr('cx', this._width - 75 - 10)
        .attr('cy', this._height - 100 - 10)
        .attr('r', 5)
        .style('fill', '#fff');
    this._scrollText = this._scrollContainer.append('text')
        .attr('class', 'scroll-text')
        .text('"SCROLL" FOR Å BØYE TIDROM');
    /*
     * Stash reference to this object.
     */
    var self = this;
    /*
     * Set scroll event handler.
     */
    this._svg.on('wheel', function() {
        /*
         * Prevent mousewheel event default behaviour. Necessary because of Safari bug.
         * See for details:
         * - https://github.com/jquery/jquery-mousewheel
         * - https://github.com/jquery/jquery-mousewheel/issues/156#issuecomment-185433754
         * - https://bugs.webkit.org/show_bug.cgi?id=149526
         */
        d3.event.preventDefault();
        /*
         * Calculate y offset. It should be restricted between 0 and 'step * size(this._imagesLinks)'
         */
        self._yOffset = Math.min(self._step * (self._imagesLinks.length - 3), Math.max(0, self._yOffset + d3.event.deltaY));
        /*
         * Calculate images array index.
         */
        var index = Math.max(0, Math.min(self._imagesLinks.length - 3, Math.round((self._yOffset / self._step))));
        /*
         * Check local and global indexes equality.
         */
        if (self._index < index) {
            /*
             * Update global index.
             */
            self._index = index;
            /*
             * Update background image.
             */
            self._images[0].attr('xlink:href', self._imagesLinks[index]);
            if (index == self._imagesLinks.length - 3) {
                /*
                 * Gradually show original image.
                 */
                self._images[2]
                    .style('opacity', 0)
                    .attr('xlink:href', self._imagesLinks[5])
                    .transition()
                    .duration(1500)
                    .style('opacity', 1);
                /*
                 * Also gradually hide and then remove scroll icon.
                 */
                self._scrollContainer
                    .transition()
                    .duration(1500)
                    .style('opacity', 0)
                    .remove();
                /*
                 * Enable painting.
                 */
                self.enablePainting();
            }
        }
    });
    /*
     * Populate chart with data.
     */
    this._update(true);
};