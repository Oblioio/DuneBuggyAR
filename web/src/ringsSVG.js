(function (window) {
    
    var duration = 0.5;
    var delay = 0.05;

    var RingsSVG = function (data) {
        this.ratio = 31/87; // ratio of outer edge to inner donut hole radius
        this.strokeWidthRatio = 0.075; // width of stroke as percentage of donut width

        this.numrings = data.numrings || 9;
        if (this.numrings === 1) {
            this.strokeWidthRatio = 1;
        }

        this.loader = data.loader;

        this.wrapper = data.wrapper || document.body;
        this.maxRadius = data.maxRadius || this.wrapper.offsetWidth / 2 - 1;
        this.rings = [];
        this.isLoading = false;

        this.radius = data.radius || this.maxRadius;
        this.innerRadius = this.radius * this.ratio;

        this.strokeWidth = this.strokeWidthRatio * (this.radius - this.innerRadius);
        // this.maxStrokeWidth = this.strokeWidthRatio * (this.maxRadius - this.maxRadius * this.ratio);
        this.rdiff = ((this.radius - this.innerRadius) - (this.numrings - 1) * this.strokeWidth) / Math.max(1, this.numrings - 2);
        this.id = Math.round(Date.now() + Math.random() * Date.now()); // use Date.now to make a uid so I don't end up with multiple elements with the same id
        this.svg = makeRings.call(this);

        this.bg = data.bg;
        if (this.bg) {
            this.wrapper.appendChild(this.bg);
        }

        this.wrapper.appendChild(this.svg);
    };

    function updateMaskUrl () {
        this.ringWrapper.setAttribute('mask', 'url(' + window.location.href + '#logomask' + this.id + ')');
    }

    function makeRings () {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute('class', 'rings');

        var ring;
        var svgNS = this.svg.namespaceURI;

        this.ringWrapper = document.createElementNS(svgNS, 'g');

        if (this.loader) {
            this.loader = document.createElementNS(svgNS, 'path');
            this.angle = 0;

            this.loader.id = 'loader';
            this.ringWrapper.appendChild(this.loader);
        }

        for (var i = 0; i < this.numrings; i++) {
            ring = document.createElementNS(svgNS, 'circle');
            ring.setAttribute('class', 'ring');
            this.ringWrapper.appendChild(ring);
            this.rings.push(ring);
        }

        this.svg.appendChild(this.ringWrapper);

        resizeRings.call(this);

        return this.svg;
    }

    function resizeRings () {
        this.innerRadius = this.radius * this.ratio;
        this.strokeWidth = this.strokeWidthRatio * (this.radius - this.innerRadius);
        var r = this.radius - this.strokeWidth * 0.5;
        var svgsize = (this.radius * 1.5) * 2; // this.maxRadius * 2 + 2;
        this.svg.setAttribute('width', svgsize);
        this.svg.setAttribute('height', svgsize);

        for (var i = 0; i < this.rings.length; i++) {
            if (r < 0) {
                continue;
            }
            let ring = this.rings[i];
            ring.setAttribute('cx', svgsize * 0.5);
            ring.setAttribute('cy', svgsize * 0.5);
            ring.setAttribute('r', r);
            ring.setAttribute('data-r', r);
            ring.setAttribute('class', 'ring');

            ring.style.strokeWidth = this.strokeWidth + 'px';
            this.rdiff = ((this.radius - this.innerRadius) - (this.numrings - 1) * this.strokeWidth) / Math.max(1, this.numrings - 2);

            r -= this.strokeWidth + this.rdiff;
        }
    }

    function loaderBGGoOut (callback) {
        TweenLite.fromTo(document.getElementById('loader_bg'), 0.5, { scale: 1 }, {scale: 0, ease: Power3.easeOut, delay: duration, onComplete: function () {
            callback() 
        }});
    }

    function loading () {
        if (!this.isLoading) {
            return;
        }

        var loading = true;
        var tl = new TimelineLite({
            onComplete: function () {
                if (loading === false) {
                    TweenLite.set(this.svg, {alpha: 0});
                    return;
                }

                if (this.isLoading) {
                    tl.play(0)
                } else {
                    loading = false;
                    loaderBGGoOut.call(this, this.isOut);
                    tl.play(0)
                }
            }.bind(this)
        });
        var radius_multiplier = this.maxRadius - this.radius;

        for (var i = 0; i < this.rings.length; i++) {
            let ring = this.rings[i];
            let base_r = Number(ring.getAttribute('data-r'));
            tl.to({t: 0}, duration * 0.5, 
                {
                    t: 1, 
                    ease: Power3.easeIn, 
                    onUpdateParams: ['{self}', ring, base_r], 
                    onUpdate: function (tween, ring, base_r) {
                        let r = base_r + tween.target.t * radius_multiplier;
                        ring.setAttribute('r', r);
                    }
                },
                i * delay
            );
            tl.to({t: 1}, duration * 0.5, 
                {
                    t: 0, 
                    ease: Power3.easeOut, 
                    onUpdateParams: ['{self}', ring, base_r], 
                    onUpdate: function (tween, ring, base_r) {
                        // let t = tween.target.t - (1 - tween.target.t) * base_r;
                        let t = tween.target.t;
                        let r = (base_r + t * radius_multiplier);

                        if (!loading) {
                            ring.style.strokeWidth = Math.max(0.1, t * this.strokeWidth);
                            tl.timeScale(1 + (1 - t) * 4);
                            r *= t;
                        }
                        ring.setAttribute('r', r);
                    }.bind(this)
                },
                i * delay + duration * 0.5
            );
        }
    }

    function resizeBG () {
        let w = window.innerWidth,
            h = window.innerHeight,
            size = Math.ceil(Math.sqrt(w * w + h * h));

        this.bg.style.left = this.bg.style.top = 'calc(50% - ' + (size * 0.5) + 'px)';
        this.bg.style.width = this.bg.style.height = size + 'px';
    }

    function resize (size, instant, callback, duration) {
        resizeRings.call(this);
        if (this.bg) {
            resizeBG.call(this);
        }

        if (this.isLoading || size === this.radius) {
            if (callback) {
                callback();
            }
            return;
        }

        if (!size) {
            size = this.wrapper.offsetWidth / 2 - 1;
        }

    }

    RingsSVG.prototype.setProgress = function (angle) {
        var half = this.svg.getAttribute('width') / 2;
        angle = Math.min(angle, 359.9);

        var r = ( angle * Math.PI / 180 ),
            x = half + Math.sin( r ) * half,
            y = half + Math.cos( r ) * - half,
            mid = ( angle > 180 ) ? 1 : 0,
            anim = 'M ' + half + ' ' + half + ' v -' + half + ' A ' + half + ' ' + half + ' 1 ' + mid + ' 1 ' +  x  + ' ' + y + ' z';

          this.loader.setAttribute( 'd', anim );
    };

    RingsSVG.prototype.stopLoading = function () {
        console.log('RINGS STOP LOADING');
        return new Promise(function (resolve, reject) {
            this.isLoading = false;
            this.isOut = resolve;
        }.bind(this));
    };

    RingsSVG.prototype.startLoading = function () {
        if (!this.isLoading) {
            this.isLoading = true;
            loading.call(this);
            console.log('START LOADING!!!');
            TweenLite.fromTo(this.svg, 0.75, {alpha: 0}, {alpha: 1, ease: Power3.easeInOut});
            TweenLite.set('#loader_bg', {scale: 1});
        }
    };

    RingsSVG.prototype.loaderBGGoOut = loaderBGGoOut;
    RingsSVG.prototype.resize = resize;

    window.oblio = window.oblio || {};
    oblio.app = oblio.app || {};
    oblio.app.RingsSVG = RingsSVG;

}(window));