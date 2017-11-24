/*! d3.chart.bubble-matrix v0.1.6 - MIT Expat */
// We should use `grunt-umd` instead of this explicit intro, but the tool does
// not camelize lib names containing '.' or '-', making the generated JS
// invalid; needs a pull request.
(function(mod) {
    // CommonJS, Node.js, browserify.
    if (typeof exports === "object" && typeof module === "object") {
        module.exports = mod(require('d3'),
                             require('d3.chart'),
                             require('d3.chart.base'),
                             require('lodash'));
        return;
    }
    // AMD.
    if (typeof define === "function" && define.amd) {
        return define(['d3', 'd3.chart', 'd3.chart.base', 'lodash'], mod);
    }
    // Plain browser (no strict mode: `this === window`).
    this.d3ChartBubbleMatrix = mod(this.d3, this.d3Chart,
                                   this.d3ChartBase, this._);
})(function(d3, d3Chart, d3ChartBase, ld) {
  "use strict";
  var exports = {};

(function() {
  exports.makeProp = function(name, fn) {
    return function(it) {
      if (it == null) {
        return this[name];
      }
      this[name] = it;
      if (fn != null) {
        fn.call(this, it);
      }
      return this;
    };
  };

  exports.textRuler = function(svgSel) {
    var onTmpText, ruler;
    onTmpText = function(str, fn) {
      var el, result;
      el = svgSel.append('text').text(str);
      result = fn(el);
      el.remove();
      return result;
    };
    ruler = ld.memoize(function(str) {
      return onTmpText(str, function(it) {
        return it.node().getComputedTextLength();
      });
    });
    ruler.extentOfChar = ld.memoize(function(char) {
      if (char.length < 1) {
        throw new Error('char can\'t be empty');
      }
      if (char.length > 1) {
        throw new Error('can get extent of a full string');
      }
      return onTmpText(char, function(it) {
        return it.node().getExtentOfChar(0);
      });
    });
    ruler.onTmpText = onTmpText;
    return ruler;
  };

  exports.layers = {};

}).call(this);

(function() {
  var STROKE_WIDTH, bubbleEnter, bubbleExit, bubbleMerge, bubbleMergeTransition, o, transformRow;

  o = {
    events: {}
  };

  STROKE_WIDTH = 0.15;

  o.dataBind = function(data) {
    var chart;
    chart = this.chart();
    if (chart.colKey_) {
      chart.bubbleKey_ = function(d, i) {
        return chart.colKey_(data.cols[i], i);
      };
    } else {
      chart.bubbleKey_ = void 0;
    }
    return this.selectAll('g.row').data(data.rows, chart.rowKey_);
  };

  o.insert = function() {
    var chart;
    chart = this.chart();
    return this.append('g').classed('row', true);
  };

  bubbleEnter = function(sel, chart) {
    this.attr('r', 0);
    this.attr('fill', function(d) {
      return chart.colorScale_(chart.color_(d));
    });
    this.attr('opacity', 0);
    return this.attr('cx', function(d, i) {
      return chart.xScale_(i);
    });
  };

  bubbleMerge = function(sel, chart) {
    return this.attr('stroke-width', STROKE_WIDTH * chart.maxRadius_);
  };

  bubbleExit = function(sel, chart) {
    return this.remove();
  };

  bubbleMergeTransition = function(sel, chart) {
    this.duration(chart.duration_);
    this.attr('opacity', 1);
    this.attr('cx', function(d, i) {
      return chart.xScale_(i);
    });
    this.attr('r', function(d) {
      return chart.radiusScale_(chart.size_(d));
    });
    return this.attr('fill', function(d) {
      return chart.colorScale_(chart.color_(d));
    });
  };

  transformRow = function(sel, chart) {
    return this.attr('transform', function(d, i) {
      return "translate(0," + (chart.yScale_(i)) + ")";
    });
  };

  o.events['enter'] = function() {
    var chart;
    chart = this.chart();
    return this.call(transformRow, chart);
  };

  o.events['merge'] = function() {
    var bubbles, chart, key;
    chart = this.chart();
    if (chart.bubbleKey_ != null) {
      key = function() {
        if (this instanceof Array) {
          return chart.bubbleKey_.apply(this, arguments);
        }
        return this.__key__;
      };
    }
    bubbles = this.selectAll('circle').data(chart.rowData_, key);
    bubbles.enter().append('circle').call(bubbleEnter, chart);
    bubbles.exit().call(bubbleExit, chart);
    bubbles.call(bubbleMerge, chart);
    if (key != null) {
      bubbles.each(function(d, i) {
        return this.__key__ = chart.bubbleKey_(d, i);
      });
    }
    return bubbles.transition().call(bubbleMergeTransition, chart);
  };

  o.events['update:transition'] = function() {
    var chart;
    chart = this.chart();
    this.duration(chart.duration_);
    return this.call(transformRow, chart);
  };

  o.events['exit'] = function() {
    return this.remove();
  };

  exports.layers['bubble'] = o;

}).call(this);

(function() {
  var o, transformCol;

  o = {
    events: {}
  };

  o.dataBind = function(data) {
    var chart;
    chart = this.chart();
    return this.selectAll('text').data(data.cols, chart.colKey_);
  };

  o.insert = function() {
    var chart;
    chart = this.chart();
    return this.append('text').attr('opacity', 0);
  };

  transformCol = function(sel, chart) {
    var bottom, slanted;
    bottom = chart.bottomMargin_;
    slanted = chart.slanted_;
    return this.attr('transform', function(d, i) {
      var result;
      result = "translate(" + (chart.xScale_(i)) + "," + bottom + ")";
      if (slanted) {
        result += 'rotate(45)';
      }
      return result;
    });
  };

  o.events['enter'] = function() {
    return this.call(transformCol, this.chart());
  };

  o.events['merge'] = function() {
    var chart;
    chart = this.chart();
    return this.text(chart.colHeader_);
  };

  o.events['enter:transition'] = function() {
    var chart;
    chart = this.chart();
    this.duration(chart.duration_);
    return this.attr('opacity', 1);
  };

  o.events['update:transition'] = function() {
    var chart;
    chart = this.chart();
    this.duration(chart.duration_);
    this.call(transformCol, chart);
    return this.attr('opacity', 1);
  };

  o.events['exit'] = function() {
    return this.remove();
  };

  exports.layers['col-header'] = o;

}).call(this);

(function() {
  var o, transformRow;

  o = {
    events: {}
  };

  o.dataBind = function(data) {
    var chart;
    chart = this.chart();
    return this.selectAll('text').data(data.rows, chart.rowKey_);
  };

  o.insert = function() {
    var chart;
    chart = this.chart();
    return this.append('text').attr('opacity', 0).attr('dy', '0.38em');
  };

  transformRow = function(sel, chart) {
    var left, width;
    width = chart.width();
    left = chart.rowHeaderLeft_;
    return this.attr('transform', function(d, i) {
      return "translate(" + left + "," + (chart.yScale_(i)) + ")";
    });
  };

  o.events['enter'] = function() {
    var chart;
    chart = this.chart();
    return this.call(transformRow, chart);
  };

  o.events['merge'] = function() {
    var chart;
    chart = this.chart();
    return this.text(function() {
      return chart.rowHeader_.apply(this, arguments);
    });
  };

  o.events['enter:transition'] = function() {
    var chart;
    chart = this.chart();
    this.duration(chart.duration_);
    return this.attr('opacity', 1);
  };

  o.events['update:transition'] = function() {
    var chart;
    chart = this.chart();
    this.duration(chart.duration_);
    this.call(transformRow, chart);
    return this.attr('opacity', 1);
  };

  o.events['exit:transition'] = function() {
    var chart;
    chart = this.chart();
    this.duration(chart.duration_);
    return this.attr('opacity', 0).remove();
  };

  exports.layers['row-header'] = o;

}).call(this);

(function() {
  var TICK_HEIGHT, o, transformThread;

  o = {
    events: {}
  };

  TICK_HEIGHT = 1;

  o.dataBind = function(data) {
    var chart;
    chart = this.chart();
    return this.selectAll('g.thread').data(data.rows, chart.rowKey_);
  };

  o.insert = function() {
    var chart, g;
    chart = this.chart();
    g = this.append('g').classed('thread', true).attr('opacity', 0);
    g.append('path');
    return g;
  };

  transformThread = function(sel, chart) {
    return this.attr('transform', function(d, i) {
      return "translate(0," + (chart.yScale_(i)) + ")";
    });
  };

  o.events['enter'] = function() {
    return this.call(transformThread, this.chart());
  };

  o.events['merge'] = function() {
    var chart, left, path, range, tickHeight;
    chart = this.chart();
    range = chart.xScale_.range();
    left = chart.leftMargin_;
    tickHeight = TICK_HEIGHT * chart.maxRadius_;
    path = "M " + left + " -" + (tickHeight / 2) + " v " + tickHeight;
    path += "M " + left + " 0 H " + range[range.length - 1];
    return this.select('path').attr('d', path);
  };

  o.events['enter:transition'] = function() {
    var chart;
    chart = this.chart();
    this.duration(chart.duration_);
    return this.attr('opacity', 1);
  };

  o.events['update:transition'] = function() {
    var chart;
    chart = this.chart();
    this.duration(chart.duration_);
    this.call(transformThread, chart);
    return this.attr('opacity', 1);
  };

  o.events['exit:transition'] = function() {
    var chart;
    chart = this.chart();
    this.duration(chart.duration_);
    return this.attr('opacity', 0).remove();
  };

  exports.layers['thread'] = o;

}).call(this);

(function() {
  var CHART_ID, CHART_NAME, DEFAULT_PALETTE, HZ_PADDING, RADIUS_PADDING, VT_PADDING, defaultColorScale, makeProp;

  makeProp = exports.makeProp;

  CHART_NAME = 'BubbleMatrix';

  CHART_ID = 'd3-chart-bubble-matrix';

  HZ_PADDING = 1.0;

  VT_PADDING = 1.0;

  RADIUS_PADDING = 0.1;

  DEFAULT_PALETTE = ['#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac'];

  defaultColorScale = function() {
    return d3.scale.quantize().domain([0, 1]).range(DEFAULT_PALETTE);
  };

  exports.Chart = d3.chart('BaseChart').extend(CHART_NAME, {
    initialize: function() {
      var gr, layer, _i, _len, _ref, _results;
      this.loadDefaults_();
      this.base.classed(CHART_ID, true);
      this.xScale_ = d3.scale.ordinal();
      this.yScale_ = d3.scale.ordinal();
      this.radiusScale_ = d3.scale.sqrt();
      this.leftMargin_ = 0;
      _ref = ['thread', 'bubble', 'row-header', 'col-header'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        layer = _ref[_i];
        gr = this.base.append('g').classed(layer, true);
        _results.push(this.layer(layer, gr, exports.layers[layer]));
      }
      return _results;
    },
    loadDefaults_: function() {
      this.rows_ || this.rows(function(d) {
        return d.rows;
      });
      this.rowHeader_ || this.rowHeader(function(d) {
        return d.name;
      });
      this.rowData_ || this.rowData(function(d) {
        return d.values;
      });
      this.column_ || this.columns(function(d) {
        return d.columns;
      });
      this.colHeader_ || this.colHeader(function(d) {
        return d;
      });
      this.size_ || this.size(function(d) {
        return d[0];
      });
      this.color_ || this.color(function(d) {
        return d[1];
      });
      this.colorScale_ || this.colorScale(defaultColorScale());
      this.slanted_ || this.slanted(false);
      return this.duration_ || this.duration(250);
    },
    transform: function(data) {
      var bottom, cols, delta, left, padding, right, rows, xDelta, yDelta;
      this.ruler_ = exports.textRuler(this.base);
      rows = this.rows_(data);
      cols = this.columns_(data);
      left = this.updateLeftMargin_(rows, this.width());
      bottom = this.getMaxBottom_(cols, this.height());
      xDelta = (this.width() - left) / cols.length;
      yDelta = (bottom - 0) / rows.length;
      this.xScale_.domain(d3.range(0, cols.length));
      this.yScale_.domain(d3.range(0, rows.length));
      delta = Math.min(xDelta, yDelta);
      right = left + delta * cols.length;
      bottom = delta * rows.length;
      this.xScale_.rangePoints([left, right], HZ_PADDING);
      this.yScale_.rangePoints([0, bottom], VT_PADDING);
      padding = this.ruler_.extentOfChar('W').height;
      this.bottomMargin_ = bottom + padding * 1.3;
      delta = (this.xScale_(1)) - (this.xScale_(0));
      this.maxRadius_ = delta * (1 - RADIUS_PADDING) / 2;
      this.radiusScale_.range([0, this.maxRadius_]);
      return {
        rows: rows,
        cols: cols
      };
    },
    updateLeftMargin_: function(data, width) {
      var leftMargin, maxWidth, padding,
        _this = this;
      leftMargin = this.leftMargin_;
      maxWidth = function(r, d, i) {
        return Math.max(r, _this.ruler_(_this.rowHeader_(d, i)));
      };
      this.rowHeaderLeft_ = ld.reduce(data, maxWidth, 0);
      padding = this.ruler_.extentOfChar('W').width;
      this.rowHeaderLeft_ += padding;
      this.leftMargin_ = this.rowHeaderLeft_ + padding;
      if (this.leftMargin_ !== leftMargin) {
        this.trigger('margin', this.leftMargin_);
      }
      return this.leftMargin_ + this.ruler_.extentOfChar('W').width;
    },
    getMaxBottom_: function(data, height) {
      return height - 2 * this.ruler_.extentOfChar('W').height;
    },
    rows: makeProp('rows_'),
    rowHeader: makeProp('rowHeader_'),
    rowKey: makeProp('rowKey_'),
    rowData: makeProp('rowData_'),
    columns: makeProp('columns_'),
    colHeader: makeProp('colHeader_'),
    colKey: makeProp('colKey_'),
    size: makeProp('size_'),
    color: makeProp('color_'),
    sizeDomain: makeProp('sizeDomain_', function(it) {
      return this.radiusScale_.domain(it);
    }),
    colorScale: makeProp('colorScale_'),
    slanted: makeProp('slanted_'),
    duration: makeProp('duration_')
  });

}).call(this);

    return exports;
});
