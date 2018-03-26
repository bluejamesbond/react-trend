'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = require('../../utils');

var _DOM = require('../../helpers/DOM.helpers');

var _math = require('../../helpers/math.helpers');

var _misc = require('../../helpers/misc.helpers');

var _Trend = require('./Trend.helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var propTypes = {
  data: _propTypes2.default.arrayOf(_propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.shape({
    value: _propTypes2.default.number
  })]).isRequired).isRequired,
  smooth: _propTypes2.default.bool,
  autoDraw: _propTypes2.default.bool,
  autoDrawDuration: _propTypes2.default.number,
  autoDrawEasing: _propTypes2.default.string,
  width: _propTypes2.default.number,
  height: _propTypes2.default.number,
  padding: _propTypes2.default.number,
  radius: _propTypes2.default.number,
  gradient: _propTypes2.default.arrayOf(_propTypes2.default.string),
  rangeHighlight: _propTypes2.default.arrayOf(_propTypes2.default.number, _propTypes2.default.number),
  rangeHighlightColor: _propTypes2.default.string,
  hoverLineColor: _propTypes2.default.string,
  hoverLineWidth: _propTypes2.default.number,
  hoverTextColor: _propTypes2.default.string,
  hoverTextSize: _propTypes2.default.number,
  hoverTextWeight: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string])
};

var defaultProps = {
  radius: 10,
  stroke: 'black',
  padding: 8,
  strokeWidth: 1,
  autoDraw: false,
  autoDrawDuration: 2000,
  autoDrawEasing: 'ease',
  rangeHighlight: [],
  rangeHighlightColor: 'transparent',
  hoverTextColor: '#aaa',
  hoverTextSize: 14,
  hoverTextWeight: 'bold',
  hoverLineColor: 'red',
  hoverLineWidth: 2
};

var Trend = function (_Component) {
  _inherits(Trend, _Component);

  function Trend(props) {
    _classCallCheck(this, Trend);

    // Generate a random ID. This is important for distinguishing between
    // Trend components on a page, so that they can have different keyframe
    // animations.
    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.trendId = (0, _misc.generateId)();
    _this.gradientId = 'react-trend-vertical-gradient-' + _this.trendId;
    _this.hoverTextNode = null;
    _this.svgNode = null;
    _this.hoverTimeout = null;
    _this.hoverLineNode = null;
    return _this;
  }

  Trend.prototype.componentDidMount = function componentDidMount() {
    var _props = this.props,
        autoDraw = _props.autoDraw,
        autoDrawDuration = _props.autoDrawDuration,
        autoDrawEasing = _props.autoDrawEasing;


    if (autoDraw) {
      this.lineLength = this.path.getTotalLength();

      var css = (0, _Trend.generateAutoDrawCss)({
        id: this.trendId,
        lineLength: this.lineLength,
        duration: autoDrawDuration,
        easing: autoDrawEasing
      });

      (0, _DOM.injectStyleTag)(css);
    }
  };

  Trend.prototype.componentWillUnmount = function componentWillUnmount() {
    clearTimeout(this.hoverTimeout);
  };

  Trend.prototype.getDelegatedProps = function getDelegatedProps() {
    return (0, _utils.omit)(this.props, Object.keys(propTypes));
  };

  Trend.prototype.handleMouseMove = function handleMouseMove(e, values) {
    var x = e.nativeEvent.offsetX;
    var svgNode = this.svgNode,
        path = this.path,
        hoverTextNode = this.hoverTextNode,
        hoverLineNode = this.hoverLineNode;

    var svgRect = svgNode.getBoundingClientRect();
    var pathRect = path.getBoundingClientRect();

    if (x >= pathRect.left - svgRect.left && x <= pathRect.left - svgRect.left + pathRect.width) {
      var computedX = x - (pathRect.left - svgRect.left);
      var value = values[Math.round(computedX / pathRect.width * (values.length - 1))];

      hoverTextNode.innerHTML = value;

      hoverLineNode.setAttribute('opacity', 1);
      hoverLineNode.setAttribute('x1', x / svgRect.width * 100 + '%');
      hoverLineNode.setAttribute('x2', x / svgRect.width * 100 + '%');

      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = setTimeout(function () {
        hoverLineNode.setAttribute('opacity', 0);
        hoverTextNode.innerHTML = '';
      }, 1000);
    } else {
      hoverLineNode.setAttribute('opacity', 0);
      hoverTextNode.innerHTML = '';
    }
  };

  Trend.prototype.renderGradientDefinition = function renderGradientDefinition() {
    var gradient = this.props.gradient;


    return _react2.default.createElement(
      'defs',
      null,
      _react2.default.createElement(
        'linearGradient',
        {
          id: this.gradientId,
          x1: '0%',
          y1: '0%',
          x2: '0%',
          y2: '100%'
        },
        gradient.slice().reverse().map(function (c, index) {
          return _react2.default.createElement('stop', {
            key: index,
            offset: (0, _math.normalize)({
              value: index,
              min: 0,
              // If we only supply a single colour, it will try to normalize
              // between 0 and 0, which will create NaN. By making the `max`
              // at least 1, we ensure single-color "gradients" work.
              max: gradient.length - 1 || 1
            }),
            stopColor: c
          });
        })
      )
    );
  };

  Trend.prototype.render = function render() {
    var _this2 = this;

    var _props2 = this.props,
        data = _props2.data,
        smooth = _props2.smooth,
        width = _props2.width,
        height = _props2.height,
        padding = _props2.padding,
        radius = _props2.radius,
        gradient = _props2.gradient,
        rangeHighlight = _props2.rangeHighlight,
        rangeHighlightColor = _props2.rangeHighlightColor,
        hoverTextSize = _props2.hoverTextSize,
        hoverTextColor = _props2.hoverTextColor,
        hoverTextWeight = _props2.hoverTextWeight,
        hoverLineColor = _props2.hoverLineColor,
        hoverLineWidth = _props2.hoverLineWidth;

    // We need at least 2 points to draw a graph.

    if (!data || data.length < 2) {
      return null;
    }

    // `data` can either be an array of numbers:
    // [1, 2, 3]
    // or, an array of objects containing a value:
    // [ { value: 1 }, { value: 2 }, { value: 3 }]
    //
    // For now, we're just going to convert the second form to the first.
    // Later on, if/when we support tooltips, we may adjust.
    var plainValues = data.map(function (point) {
      return typeof point === 'number' ? point : point.value;
    });

    // Our viewbox needs to be in absolute units, so we'll default to 300x75
    // Our SVG can be a %, though; this is what makes it scalable.
    // By defaulting to percentages, the SVG will grow to fill its parent
    // container, preserving a 1/4 aspect ratio.
    var viewBoxWidth = width || 300;
    var viewBoxHeight = height || 75;
    var svgWidth = width || '100%';
    var svgHeight = height || '25%';

    var normalizedValues = (0, _Trend.normalizeDataset)(plainValues, {
      minX: padding,
      maxX: viewBoxWidth - padding,
      // NOTE: Because SVGs are indexed from the top left, but most data is
      // indexed from the bottom left, we're inverting the Y min/max.
      minY: viewBoxHeight - padding,
      maxY: padding
    });

    var path = smooth ? (0, _DOM.buildSmoothPath)(normalizedValues, { radius: radius }) : (0, _DOM.buildLinearPath)(normalizedValues);

    var rangeHighlightStart = void 0;
    var rangeHighlightEnd = void 0;

    if (rangeHighlight.length === 2) {
      var first = rangeHighlight[0],
          second = rangeHighlight[1];


      rangeHighlightStart = normalizedValues[first].x;
      rangeHighlightEnd = normalizedValues[second].x;

      var gap = normalizedValues[1].x - normalizedValues[0].x;

      rangeHighlightStart -= gap / 2;
      rangeHighlightEnd += gap / 2;
    }

    return _react2.default.createElement(
      'svg',
      _extends({
        onMouseMove: function onMouseMove(e) {
          _this2.handleMouseMove(e, plainValues);
        },
        width: svgWidth,
        height: svgHeight,
        ref: function ref(_ref3) {
          _this2.svgNode = _ref3;
        },
        viewBox: '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight
      }, this.getDelegatedProps()),
      gradient && this.renderGradientDefinition(),
      rangeHighlightStart && rangeHighlightEnd && _react2.default.createElement('rect', {
        x: rangeHighlightStart, y: 0,
        stroke: 'transparent',
        strokeWidth: 0,
        fill: rangeHighlightColor,
        width: rangeHighlightEnd - rangeHighlightStart, height: viewBoxHeight
      }),
      _react2.default.createElement('path', {
        ref: function ref(elem) {
          _this2.path = elem;
        },
        id: 'react-trend-' + this.trendId,
        d: path,
        fill: 'none',
        stroke: gradient ? 'url(#' + this.gradientId + ')' : undefined
      }),
      _react2.default.createElement('text', {
        fill: hoverTextColor,
        fontSize: hoverTextSize,
        fontWeight: hoverTextWeight,
        stroke: 'none',
        alignmentBaseline: 'hanging',
        textAnchor: 'top',
        ref: function ref(_ref) {
          _this2.hoverTextNode = _ref;
        }
      }),
      _react2.default.createElement('line', {
        opacity: 0,
        ref: function ref(_ref2) {
          _this2.hoverLineNode = _ref2;
        },
        x1: '0',
        y1: '0',
        x2: '0',
        y2: '100%',
        stroke: hoverLineColor,
        strokeWidth: hoverLineWidth
      })
    );
  };

  return Trend;
}(_react.Component);

process.env.NODE_ENV !== "production" ? Trend.propTypes = propTypes : void 0;
Trend.defaultProps = defaultProps;

exports.default = Trend;
module.exports = exports['default'];